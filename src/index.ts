import mongoose from "mongoose";
import { config } from "dotenv";

import { WABot } from "./WABot";
import {
  MongoDbAuthStrategy,
  LocalFileAuthStrategy,
} from "./WAClient/AuthStrategy";
import { YouTubeFeature } from "./WABot/features/youtube/youtube";
import { UniNotificationFeature } from "./WABot/features/uni-notifications/uni-notifications";

config();

async function main() {
  await mongoose.connect(process.env.MONGO_URL);

  const bot = new WABot({
    clientSettings: {
      authStrategy: process.env.TESTING
        ? new LocalFileAuthStrategy("auth.json")
        : new MongoDbAuthStrategy("Talha"),
      sockOptions: { printQRInTerminal: true },
    },
  });

  bot.addFeature(new YouTubeFeature());
  bot.addFeature(new UniNotificationFeature("my_account"));
}
main();
