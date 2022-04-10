import { proto } from "@adiwajshing/baileys";
import { Image, JPEGStream, loadImage } from "canvas";
import path from "path"
import MemeFeature from "./meme";

export const drawText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number
) => {
  const height = 50;
  ctx.font = `bold ${height}px Open Sans`;
  const { width } = ctx.measureText(text);

  if (width > maxWidth) {
    ctx.font = `bold ${Math.floor((maxWidth / width) * height)}px Open Sans`;
  }

  ctx.fillText(text, x, y, maxWidth);
};

export const loadAndCacheImage = (url: string) => {
  let image: Image;

  return async () => {
    if (!image)
      image = await loadImage(url);

    return image
  }
}

export const createTextMemeHandler = (artGenerator: (...args: string[]) => Promise<JPEGStream>, imageMimeType: string = "image/jpeg") => {
  return async (
    messageInfo: proto.IWebMessageInfo,
    feature: MemeFeature
  ) => {

    if (!MemeFeature.isTextMessage(messageInfo)) {
      return;
    }

    const [, , args] = MemeFeature.getProcessedCommand(messageInfo);
    const texts = args
      .split(",")
      .map((text) => text.trim());

    const art = await artGenerator(...texts);

    return feature.socket.sendMessage(messageInfo.key.remoteJid, {
      image: { stream: art },
      mimetype: imageMimeType,
    });
  }

}


