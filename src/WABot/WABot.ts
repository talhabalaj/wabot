import { MessageUpdateType, proto, WASocket } from "@adiwajshing/baileys";
import { Logger, LoggerOptions } from "pino";
import WLogger from "../utils/logger";
import { WAClient, WAClientConfig } from "../WAClient";
import { IWABotFeature } from "./WABotFeature";

export interface WABotConfig {
  clientSettings: WAClientConfig;
}

export default class WABot {
  private _wa: WAClient;
  private features: IWABotFeature[] = [];

  private get wa() {
    return this._wa;
  }
  constructor(
    config: WABotConfig,
    private logger: Logger<LoggerOptions> = WLogger
  ) {
    this._wa = new WAClient(config.clientSettings);
    this.register();
  }

  private register() {
    this.wa.onSocketChange((sock) => {
      this.features.forEach((feature) => feature.onSocketConnected(sock));
    });
    
    this.wa.addHandler("messages.upsert", (args) => {
      args.messages.forEach((message) => {
        this.features.forEach((feature) =>
          feature.onNewMessage(message).catch((err) => {
            this.logger.error(err, "Failed handling request by feature");
          })
        );
      });
    });

    this.wa.addHandler("chats.upsert", (args) => {
      this.features.forEach((feature) =>
        feature.onNewChat(args).catch((err) => {
          this.logger.error(err, "Failed handling request by feature");
        })
      );
    })
  }

  public async addFeature(feature: IWABotFeature) {
    this.features.push(feature);
  }
}
