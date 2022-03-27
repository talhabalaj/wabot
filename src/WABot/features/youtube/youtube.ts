import { WAMessage } from "@adiwajshing/baileys";
import { BaseWAFeature } from "../../WABotFeature";
import {
  downloadMP3Buffer,
  downloadMP4Buffer,
  getSearchResultFromYouTube,
  getYoutubeInfo,
} from "./utils";

export class YouTubeFeature extends BaseWAFeature {
  public async onNewMessage(messageInfo: WAMessage): Promise<void> {
    if (messageInfo.key.fromMe) return;

    const { message } = messageInfo;

    if (!message && !message?.conversation && !message?.extendedTextMessage)
      return;

    const text = message.conversation || message.extendedTextMessage?.text;

    if (!text) return;

    if (!text.startsWith("pls audio") && !text.startsWith("pls video")) return;

    const [, type, ...songParts] = text.split(" ");
    const songName = songParts.join(" ");

    this.logger.info(`[YouTube] Searching for ${songName}`);
    const song = await getSearchResultFromYouTube(songName);
    this.logger.info(song, `[YouTube] Found`);

    if (!song) {
      await this.socket.sendMessage(messageInfo.key.remoteJid, {
        text: "Kera ganay ay? Menu nahi laba.",
      });
      return;
    }

    const link = (song as any)["url"];
    const isVideo = type == "video";
    const info = await getYoutubeInfo(link);

    await this.socket.sendMessage(messageInfo.key.remoteJid, {
      text: `*${info.videoDetails.media.song ?? info.videoDetails.title}* by *${
        info.videoDetails.media.artist ?? info.videoDetails.author.name
      }*, Right?\n\nProcessing your request, please wait while I bake it in my big kitchen. Hope you aren't too hungry.`,
    });

    let buffer: Buffer;
    if (isVideo) {
      buffer = await downloadMP4Buffer(info);
    } else {
      buffer = await downloadMP3Buffer(info);
    }

    if (!!buffer) {
      try {
        if (isVideo) {
          await this.socket.sendMessage(messageInfo.key.remoteJid, {
            video: buffer,
            mimetype: "video/mp4",
          });
        } else {
          await this.socket.sendMessage(messageInfo.key.remoteJid, {
            audio: buffer,
            mimetype: "audio/mp4",
          });
        }
      } catch (e) {
        this.logger.error(e, "[Media Upload]");
      }
    }
  }
}
