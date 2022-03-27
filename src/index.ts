import mongoose from "mongoose";
import { config } from "dotenv";

import { WABot } from "./WABot";
import { MongoDbAuthStrategy } from "./WAClient/AuthStrategy";
import { YouTubeFeature } from "./WABot/features/youtube/youtube";

config();

async function main() {
  await mongoose.connect(process.env.MONGO_URL);

  const bot = new WABot({
    clientSettings: {
      authStrategy: new MongoDbAuthStrategy("Talha"),
      sockOptions: { printQRInTerminal: true },
    },
  });

  bot.addFeature(new YouTubeFeature());
}
main();
