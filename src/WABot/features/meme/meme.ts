import axios from "axios";
import { proto } from "@adiwajshing/baileys";
import { BaseWAFeature } from "../../WABotFeature";
import { createSlapArt } from "./slap/slap";
import { downloadImage } from "../../../utils";
import { createDrakeArt } from "./drake/drake";

export default class MemeFeature extends BaseWAFeature {
  constructor() {
    super();
  }

  private static canBeTargetted(jid: string) {
    return !["923034793063@s.whatsapp.net"].includes(jid);
  }

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

      if (!MemeFeature.canBeTargetted(mention)) {
        return this.socket.sendMessage(messageInfo.key.remoteJid, {
          text: "Baba kisko marne ki koshish kar rha, sharam nahi ata?",
        });
      }

      const slapperProfileImageUrl: string | null = await this.socket
        .profilePictureUrl(messageInfo.key.participant, "image")
        .catch(() => null);

      if (!slapperProfileImageUrl) {
        return this.socket.sendMessage(messageInfo.key.remoteJid, {
          text: "Phele dp laga apni ghalib",
        });
      }

      const beingSlappedProfileImageUrl: string | null = await this.socket
        .profilePictureUrl(mention, "image")
        .catch(() => null);

      if (!beingSlappedProfileImageUrl) {
        return this.socket.sendMessage(messageInfo.key.remoteJid, {
          text: `Sala dp nahi hai @${mention.split('@')[0]} ki.`,
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

      return this.socket.sendMessage(messageInfo.key.remoteJid, {
        image: { stream: art },
        mimetype: "image/jpeg",
      });
    },
    drake: async (messageInfo: proto.IWebMessageInfo) => {
      this.logger.info("Drake issued");

      if (!MemeFeature.isTextMessage(messageInfo)) {
        return;
      }

      const [, , args] = MemeFeature.getProcessedCommand(messageInfo);
      const [text1 = "kush likh", text2 = "comma laga"] = args
        .split(",", 2)
        .map((text) => text.trim());

      const art = await createDrakeArt(text1, text2);

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
