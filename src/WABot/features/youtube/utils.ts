import ytdl from "ytdl-core";
import stream from "memorystream";
import Ffmpeg from "fluent-ffmpeg";
import ytsr from "ytsr";

function fixArgsForFluentFfmpeg(string: string): string {
  // The science needed for fluent-ffmpeg to accpet multi-string
  return `${string}${string.split(" ").length == 2 ? " " : ""}`;
}

const getMetadataOfVideoForFfmpeg = (info: ytdl.videoInfo) => {
  const title = fixArgsForFluentFfmpeg(
    info.videoDetails.media?.song || info.videoDetails.title
  );
  const artist = fixArgsForFluentFfmpeg(
    info.videoDetails.media?.artist || info.videoDetails.author?.name
  );
  const album = fixArgsForFluentFfmpeg(
    info.videoDetails.media?.category || "Single"
  );

  return [
    "-metadata",
    `title=${title}`,
    "-metadata",
    `artist=${artist}`,
    "-metadata",
    `album=${album}`,
  ];
};

export const getSearchResultFromYouTube = async (query: string) => {
  if (query == "") return null;

  try {
    const songResults = (
      await ytsr(query, { limit: 10, safeSearch: true })
    ).items.filter((item) => item.type == "video");
    if (songResults.length > 0) {
      return songResults[0];
    } else {
      return null;
    }
  } catch (e) {
    console.error("[YouTube Search]", e);
  }
};

export const getYoutubeInfo = async (link: string) => {
  try {
    return await ytdl.getInfo(link);
  } catch (e) {
    console.error("[Youtube Info Request]", e);
  
  }
};

export const downloadMP3Buffer = (info: ytdl.videoInfo) =>
  new Promise<Buffer>((res, rej) => {
    let filteredFormats = info.formats.filter((format) => format.itag == 140);

    if (filteredFormats.length <= 0) {
      filteredFormats = info.formats.filter(
        (format) =>
          format.itag == 250 || format.itag == 251 || format.itag == 249
      );
    }

    const format = filteredFormats[0];

    if (parseInt(format.contentLength) > 2 ** 20 * 100) {
      rej(Error("Size limit of 100MB applies."));
    }

    const video = ytdl.downloadFromInfo(info, { quality: format.itag });
    const videoStream = new stream();
    const convertedStream = new stream();

    video.on("error", (e) => {
      console.error("[YouTube Download]", e);
      rej(
        Error(
          "Sorry, There's been a technical error (YouTube Download). Please try again in sometime."
        )
      );
    });

    video.pipe(videoStream);

    Ffmpeg()
      .input(videoStream)
      .inputFormat(format.container)
      .outputFormat("mp3")
      .outputOptions(getMetadataOfVideoForFfmpeg(info))
      .on("error", function (err) {
        rej(err);
      })
      .on("end", () => res(convertedStream.read()))
      .writeToStream(convertedStream);
  });

export const downloadMP4Buffer = (info: ytdl.videoInfo) =>
  new Promise<Buffer>((res, rej) => {
    const filteredFormats = info.formats.filter((format) => format.itag == 18);
    const format = filteredFormats[0];

    if (!format) {
      rej(
        Error(
          "Correct format for this video is not available, try repharsing it."
        )
      );
    }

    if (parseInt(format.contentLength) > 2 ** 20 * 100) {
      rej(Error("Size limit of 100MB applies."));
    }

    const video = ytdl.downloadFromInfo(info, { quality: format.itag });

    video.on("error", (e) =>
      rej(
        Error(
          "Sorry, There's been a technical error (YouTube Download). Please try again in sometime."
        )
      )
    );

    const temp = [];
    video.on("data", (d) => temp.push(d));
    video.on("end", () => res(Buffer.concat(temp)));
  });
