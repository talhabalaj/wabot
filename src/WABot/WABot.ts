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

  private registerFeature(feature: IWABotFeature) {
    this.wa.onSocketChange((sock) => feature.onSocketConnected(sock));
    this.wa.addHandler("messages.upsert", (args) => {
      args.messages.forEach((message) => {
        feature.onNewMessage(message);
      });
    });
  }

  constructor(config: WABotConfig) {
    this._wa = new WAClient(config.clientSettings);
  }

  public async addFeature(feature: IWABotFeature) {
    this.features.push(feature);
    this.registerFeature(feature);
  }
}
