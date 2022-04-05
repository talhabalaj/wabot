import axios from "axios";
import { proto } from "@adiwajshing/baileys";
import { BaseWAFeature } from "../../WABotFeature";
import { createSlapArt } from "./slap/slap";
import { downloadImage } from "../../../utils";

export default class MemeFeature extends BaseWAFeature {
  private messageHandlers = {
    slap: async (messageInfo: proto.IWebMessageInfo) => {
      this.logger.info("Slap issued");

      if (!messageInfo.message.extendedTextMessage) {
        return this.socket.sendMessage(messageInfo.key.remoteJid, {
          text: "Kisi ko mention kar ke re baba",
        });
      }
      const [, , args] = MemeFeature.getProcessedCommand(messageInfo);

      this.logger.info(args, "Slap args");

      const mentions =
        messageInfo.message.extendedTextMessage.contextInfo.mentionedJid;

      this.logger.trace(mentions, "Mentions");

      if (mentions.length < 1) {
        return this.socket.sendMessage(messageInfo.key.remoteJid, {
          text: "Kisi ko mention kar ke re baba",
        });
      }

      const mention = mentions[0];

      const slapperProfileImage = await downloadImage(
        await this.socket.profilePictureUrl(
          messageInfo.key.participant,
          "image"
        )
      );
      
      const beingSlappedProfileImage = await downloadImage(
        await this.socket.profilePictureUrl(mention, "image")
      );

      const art = await createSlapArt(
        slapperProfileImage,
        beingSlappedProfileImage
      );

      return this.socket.sendMessage(messageInfo.key.remoteJid, {
        image: { stream: art },
        mimetype: "image/jpeg",
      });
    },
  };

  private prefix: string = "pls";

  async onNewMessage(messageInfo: proto.IWebMessageInfo): Promise<void> {
    this.logger.info(
      messageInfo,
      `New message from ${messageInfo.key.remoteJid}`
    );

    if (MemeFeature.isTextMessage(messageInfo)) {
      const text = MemeFeature.getText(messageInfo);
      const [prefix, command] = text.split(" ");

      if (prefix !== this.prefix) return;

      const handler = this.messageHandlers[command];

      if (handler) {
        await handler(messageInfo);
      }
    }
  }
}
