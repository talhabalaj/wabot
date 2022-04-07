import { proto } from "@adiwajshing/baileys";
import {
  createCanvas,
  Image,
  loadImage,
  CanvasRenderingContext2D,
} from "canvas";
import path from "path";
import MemeFeature from "../meme";

let image: Image;

async function getSlapImage() {
  if (!image)
    image = await loadImage(path.join(__dirname, "./assets/drake.jpg"));

  return image;
}

const drawText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number
) => {
  const height = 50;
  ctx.font = `${height}px Open Sans`;
  const { width } = ctx.measureText(text);

  if (width > maxWidth) {
    ctx.font = `${Math.floor((maxWidth / width) * height)}px Open Sans`;
  }

  ctx.fillText(text, x, y, maxWidth);
};

export async function createDrakeArt(text1: string, text2: string) {
  const slapImage = await getSlapImage();
  const canvas = createCanvas(slapImage.width, slapImage.height);
  const ctx = canvas.getContext("2d");
  const maxWidth = 350;

  ctx.drawImage(slapImage, 0, 0);

  drawText(ctx, text1, 275, 150, maxWidth);
  drawText(ctx, text2, 275, 400, maxWidth);

  return canvas.createJPEGStream({ quality: 100 });
}

export async function handleDrakeMessage(
  messageInfo: proto.IWebMessageInfo,
  feature: MemeFeature
) {
  feature.logger.info("Drake issued");

  if (!MemeFeature.isTextMessage(messageInfo)) {
    return;
  }

  const [, , args] = MemeFeature.getProcessedCommand(messageInfo);
  const [text1 = "kush likh", text2 = "comma laga"] = args
    .split(",", 2)
    .map((text) => text.trim());

  const art = await createDrakeArt(text1, text2);

  return feature.socket.sendMessage(messageInfo.key.remoteJid, {
    image: { stream: art },
    mimetype: "image/jpeg",
  });
}
