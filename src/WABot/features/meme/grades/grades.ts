import {
  createCanvas,
} from "canvas";
import { loadAndCacheImage, drawText } from "../utils";
import path from "path"

const getGradesImage = loadAndCacheImage(path.join(__dirname, "./assets/grades.jpg"))

export async function createGradesArt(text1: string, text2: string) {
  const gradesImage = await getGradesImage();
  const canvas = createCanvas(gradesImage.width, gradesImage.height);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(gradesImage, 0, 0);

  drawText(ctx, text1, 500, 225, 260);
  drawText(ctx, text1, 615, 700, 170);
  drawText(ctx, text2, 22, 800, 400);

  return canvas.createJPEGStream({ quality: 100 });
}
