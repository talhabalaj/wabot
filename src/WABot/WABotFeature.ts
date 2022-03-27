import { WAMessage, WASocket } from "@adiwajshing/baileys";
import { Logger, LoggerOptions } from "pino";
import WLogger from "../utils/logger";

export interface IWABotFeature {
  onSocketConnected(socket: WASocket): void;
  onNewMessage(message: WAMessage): Promise<void>;
}

export abstract class BaseWAFeature implements IWABotFeature {
  protected socket: WASocket;

  constructor(protected logger: Logger<LoggerOptions> = WLogger) {}

  public async onSocketConnected(socket: WASocket) {
    this.socket = socket;
  }

  abstract onNewMessage(message: WAMessage): Promise<void>;
}
