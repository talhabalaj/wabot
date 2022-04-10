import { proto } from "@adiwajshing/baileys";
import { BaseWAFeature } from "../../WABotFeature";
import { createDrakeArt } from "./drake";
import { createGradesArt } from "./grades";
import { handleSlapMessage } from "./slap";
import { createTextMemeHandler } from "./utils";

export default class MemeFeature extends BaseWAFeature {
  constructor() {
    super();
  }

  static canBeTargetted(jid: string) {
    return !["923034793063@s.whatsapp.net"].includes(jid);
  }

  private messageHandlers = {
    slap: handleSlapMessage,
    drake: createTextMemeHandler(createDrakeArt),
    grades: createTextMemeHandler(createGradesArt)
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
        await handler(messageInfo, this);
      }
    }
  }
}
