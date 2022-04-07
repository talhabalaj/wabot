import { proto } from "@adiwajshing/baileys";
import { createCanvas, Image, loadImage } from "canvas";
import path from "path";
import { downloadImage } from "../../../../utils";
import MemeFeature from "../meme";
import { loadAndCacheImage } from "../utils";


const getSlapImage = loadAndCacheImage(path.join(__dirname, "./assets/slap.jpg"))

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

export async function handleSlapMessage(
  messageInfo: proto.IWebMessageInfo,
  feature: MemeFeature
) {
  feature.logger.info("Slap issued");

  if (!messageInfo.message.extendedTextMessage) {
    return feature.socket.sendMessage(messageInfo.key.remoteJid, {
      text: "Kisi ko mention kar ke re baba",
    });
  }
  const [, , args] = MemeFeature.getProcessedCommand(messageInfo);

  feature.logger.info(args, "Slap args");

  const mentions =
    messageInfo.message.extendedTextMessage.contextInfo.mentionedJid;

  feature.logger.trace(mentions, "Mentions");

  if (mentions.length < 1) {
    return feature.socket.sendMessage(messageInfo.key.remoteJid, {
      text: "Kisi ko mention kar ke re baba",
    });
  }

  const mention = mentions[0];

  if (!MemeFeature.canBeTargetted(mention)) {
    return feature.socket.sendMessage(messageInfo.key.remoteJid, {
      text: "Baba kisko marne ki koshish kar rha, sharam nahi ata?",
    });
  }

  const slapperProfileImageUrl: string | null = await feature.socket
    .profilePictureUrl(messageInfo.key.participant, "image")
    .catch(() => null);

  if (!slapperProfileImageUrl) {
    return feature.socket.sendMessage(messageInfo.key.remoteJid, {
      text: "Phele dp laga apni ghalib",
    });
  }

  const beingSlappedProfileImageUrl: string | null = await feature.socket
    .profilePictureUrl(mention, "image")
    .catch(() => null);

  if (!beingSlappedProfileImageUrl) {
    return feature.socket.sendMessage(messageInfo.key.remoteJid, {
      text: `Sala dp nahi hai @${mention.split("@")[0]} ki.`,
      mentions: [mention],
    });
  }

  const slapperProfileImage = await downloadImage(slapperProfileImageUrl);
  const beingSlappedProfileImage = await downloadImage(
    beingSlappedProfileImageUrl
  );

  const art = await createSlapArt(
    slapperProfileImage,
    beingSlappedProfileImage
  );

  return feature.socket.sendMessage(messageInfo.key.remoteJid, {
    image: { stream: art },
    mimetype: "image/jpeg",
  });
}
