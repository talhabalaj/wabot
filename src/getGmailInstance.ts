import { google } from "googleapis";
import { db, getConfig } from "./getFirebaesDb";
import { createInterface } from "readline";

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

export async function getGmailInstance() {
  const auth = new google.auth.OAuth2({
    
    redirectUri: "https://localhost:4000/",
  });

  if (!getConfig()) return;

  const snapshot = getConfig().gmailAuthToken;

  let tokens = snapshot.val();

  if (!tokens) {
    const url = auth.generateAuthUrl({
      // 'online' (default) or 'offline' (gets refresh_token)
      access_type: "offline",

      // If you only need one scope you can pass it as a string
      scope: SCOPES,
    });

    console.log(`go to ${url}`);

    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const code: string = await new Promise((res, rej) =>
      rl.question("Auth Code: ", res)
    );

    rl.close();

    const data = await auth.getToken({ code });
    tokens = data.tokens;

    await db.child("gmailAuthToken").set(tokens);
  }
  auth.setCredentials(tokens);

  google.options({ auth });

  return google.gmail({ version: "v1", auth }).users.messages;
}
