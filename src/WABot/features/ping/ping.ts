import { WAMessage } from "@adiwajshing/baileys";
import { BaseWAFeature } from "../../WABotFeature";

export class PingFeature extends BaseWAFeature {
  public async onNewMessage(message: WAMessage): Promise<void> {
    if (message.key.fromMe) return;

    if (
      message.message?.conversation ||
      message.message?.extendedTextMessage?.text
    ) {
      await this.socket.sendMessage(message.key.remoteJid, {
        text: `${message.pushName}: ${
          message.message?.conversation ||
          message.message?.extendedTextMessage.text
        }`,
      });
    }
  }
}
