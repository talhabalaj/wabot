import { createCanvas, Image, loadImage } from "canvas";
import path from "path";

let image: Image;

async function getSlapImage() {
  if (!image)
    image = await loadImage(path.join(__dirname, "../slap/assets/slap.jpg"));

  return image;
}

export async function createSlapArt(slapper: Buffer, beingSlapped: Buffer) {
  const slapImage = await getSlapImage();
  const slapperImage = await loadImage(slapper);
  const beingSlappedImage = await loadImage(beingSlapped);
  const canvas = createCanvas(slapImage.width, slapImage.height);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(slapImage, 0, 0);
  ctx.drawImage(beingSlappedImage, 226, 45, 202, 202);
  ctx.drawImage(slapperImage, 656, 14, 202, 202);

  return canvas.createJPEGStream({ quality: 100 });
}
