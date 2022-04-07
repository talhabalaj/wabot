import {
  createCanvas,
} from "canvas";
import { loadAndCacheImage, drawText } from "../utils";
import path from "path"

const getDrakeImage = loadAndCacheImage(path.join(__dirname, "./assets/drake.jpg"))

export async function createDrakeArt(text1: string, text2: string) {
  const drakeImage = await getDrakeImage();
  const canvas = createCanvas(drakeImage.width, drakeImage.height);
  const ctx = canvas.getContext("2d");
  const maxWidth = 350;

  ctx.drawImage(drakeImage, 0, 0);

  drawText(ctx, text1, 275, 150, maxWidth);
  drawText(ctx, text2, 275, 400, maxWidth);

  return canvas.createJPEGStream({ quality: 100 });
}
