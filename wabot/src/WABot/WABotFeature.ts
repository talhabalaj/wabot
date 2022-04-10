import { Chat, WAMessage, WASocket } from "@adiwajshing/baileys";
import { Logger, LoggerOptions } from "pino";
import WLogger from "../utils/logger";

export interface IWABotFeature {
  onSocketConnected(socket: WASocket): void;
  onNewMessage(message: WAMessage): Promise<void>;
  onNewChat(chat: Chat[]): Promise<void>;
}

export abstract class BaseWAFeature implements IWABotFeature {
  public socket: WASocket;

  constructor(public logger: Logger<LoggerOptions> = WLogger) {}

  public async onSocketConnected(socket: WASocket) {
    this.socket = socket;
  }

  static isTextMessage({ message, key }: WAMessage, fromMe = false): boolean {
    if (!message) return false;
    if (key.fromMe && !fromMe) return false;

    return !!message.conversation || !!message.extendedTextMessage;
  }

  static getText(messageInfo: WAMessage): string {
    if (BaseWAFeature.isTextMessage(messageInfo)) {
      return (
        messageInfo.message.conversation ||
        messageInfo.message?.extendedTextMessage?.text
      );
    }
  }

  static getProcessedCommand(messageInfo: WAMessage): [string, string, string] {
    const text = BaseWAFeature.getText(messageInfo);

    if (!text) return;

    const [prefix, command, ...args] = text.split(" ");

    return [prefix, command, args.join(" ")];
  }

  async onNewMessage(message: WAMessage): Promise<void> {}

  async onNewChat(chat: Chat[]): Promise<void> {}
}
