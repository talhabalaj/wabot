import axios from "axios";

export const base64Decode = (data: string) =>
  Buffer.from(data, "base64").toString("ascii");

export const downloadImage = async (url: string) => {
  const image = await axios.get(url, {
    responseType: "arraybuffer",
  });

  const buffer = Buffer.from(image.data, "binary");

  return buffer;
};
