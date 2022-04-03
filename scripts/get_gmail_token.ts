import { google } from "googleapis";
import { createInterface } from "readline";
import { config } from "dotenv";
import { createServer } from "http";
import { parse } from "url";
import mongoose from "mongoose";

import { ThirdPartyAuthModel } from "../src/database/ThirdPathAuth";

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

config();

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

export async function getAuth() {
  await mongoose.connect(process.env.MONGO_URL)

  const auth = new google.auth.OAuth2({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: "http://localhost:4000/",
  });

  const accountName: string = await new Promise((res, rej) =>
    rl.question("Name: ", res)
  );

  const server = createServer(async (req, res) => {
    const url = parse(req.url, true);
    let { code } = url.query;
    code = code as string;

    if (code) {
      const data = await auth.getToken({ code });

      if (data) {
        const { tokens } = data;

        const authStore = await ThirdPartyAuthModel.findOne({
          name: accountName,
          type: "gmail",
        });

        if (authStore) {
          authStore.creds = tokens;
          await authStore.save();
        } else {
          await ThirdPartyAuthModel.create({
            name: accountName,
            type: "gmail",
            tokens,
          });
        }
      }
      res.end("<h1>Success!</h1>");
      rl.close();
      process.exit(0);
    } else {
      res.end("<h1>Error! There is no code</h1>");
    }
  });

  server.listen(4000);

  const url = auth.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: "offline",

    // If you only need one scope you can pass it as a string
    scope: SCOPES,
  });

  console.log(`go to ${url}`);
}

getAuth();
