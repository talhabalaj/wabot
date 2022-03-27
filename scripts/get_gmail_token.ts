import { google } from "googleapis";
import { createInterface } from "readline";
import { config } from "dotenv";

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

config();

export async function getAuth() {
  const auth = new google.auth.OAuth2({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: "https://localhost:4000/",
  });

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

  console.log(data);
}

getAuth();
