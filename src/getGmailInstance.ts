// import { google } from "googleapis";
// import { db, getConfig } from "./getFirebaesDb";
// import { createInterface } from "readline";

// const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

// export async function getGmailInstance() {
//   const auth = new google.auth.OAuth2({
    
//     redirectUri: "https://localhost:4000/",
//   });

//   if (!getConfig()) return;

//   const snapshot = getConfig().gmailAuthToken;

//   let tokens = snapshot.val();

//   if (!tokens) {
//     const url = auth.generateAuthUrl({
//       // 'online' (default) or 'offline' (gets refresh_token)
//       access_type: "offline",

//       // If you only need one scope you can pass it as a string
//       scope: SCOPES,
//     });

//     console.log(`go to ${url}`);

//     const rl = createInterface({
//       input: process.stdin,
//       output: process.stdout,
//     });

//     const code: string = await new Promise((res, rej) =>
//       rl.question("Auth Code: ", res)
//     );

//     rl.close();

//     const data = await auth.getToken({ code });
//     tokens = data.tokens;

//     await db.child("gmailAuthToken").set(tokens);
//   }
//   auth.setCredentials(tokens);

//   google.options({ auth });

//   return google.gmail({ version: "v1", auth }).users.messages;
// }


  // const gmail = await getGmailInstance();

  // if (gmail) console.log("GMAIL client was launched");
  // listForMessages(gmail);
  // // client.sock.ev.on("chats.update", console.log);

  // async function listForMessages(gmail: gmail_v1.Resource$Users$Messages) {
  //   if (getConfig() && gmail) {
  //     const { lastUpdateTime, groupJid, gmailFilter } = getConfig();
  //     console.log("listing messages");
  //     const messages = await gmail.list({
  //       userId: "me",
  //       q: gmailFilter ? gmailFilter : undefined,
  //     });

  //     if (lastUpdateTime !== null && messages.data.messages) {
  //       for (const messageIds of messages.data.messages) {
  //         const message = (await gmail.get({ id: messageIds.id, userId: "me" }))
  //           .data;

  //         const messageDate = Date.parse(message.internalDate);
  //         if (messageDate > lastUpdateTime) {
  //           if (message.payload.parts) {
  //             let text = message.payload.parts.find(
  //               (e) => e.mimeType === "text/plain" && e.filename === ""
  //             );
  //             let decodedText: string | undefined;

  //             if (!text) {
  //               text = message.payload.parts.find(
  //                 (e) => e.mimeType === "text/html" && e.filename === ""
  //               );

  //               if (text) {
  //                 decodedText = convert(base64Decode(text.body.data));
  //               }
  //             } else {
  //               decodedText = base64Decode(text.body.data);
  //             }

  //             if (decodedText) {
  //               await client.sock.sendMessage(groupJid, {
  //                 text: decodedText,
  //               });
  //             }
  //             const attachments = message.payload.parts.filter(
  //               (e) => e.filename !== ""
  //             );

  //             for (const attachment of attachments) {
  //               const downloadedAttachment = await gmail.attachments.get({
  //                 id: attachment.body.attachmentId,
  //                 messageId: message.id,
  //                 userId: "me",
  //               });

  //               const tempFile = path.join("/tmp", attachment.filename);
  //               await fs.writeFile(
  //                 tempFile,
  //                 Buffer.from(downloadedAttachment.data.data, "base64")
  //               );

  //               await client.sock.sendMessage(groupJid, {
  //                 document: {
  //                   url: tempFile,
  //                 },
  //                 mimetype: attachment.mimeType,
  //                 fileName: attachment.filename,
  //               });

  //               await fs.unlink(tempFile);
  //             }
  //           }
  //         } else {
  //           break;
  //         }
  //       }
  //     }

  //     await db.child("lastUpdateTime").set(Date.now());
  //   }

  //   setTimeout(() => {
  //     listForMessages(gmail);
  //   }, 5 * 60 * 1000);
  // }

  // client.sock.ev.on("chats.update", console.log);
  // client.sock.ev.on("chats.upsert", console.log);
  // client.sock.ev.on("chats.delete", console.log);

  // client.sock.ev.on("messages.upsert", ({ messages, type }) => {
  //   for (const message of messages) {
  //     if (message.key.fromMe) continue;

  //     console.log(type, message);
  //   }
  // });
// }


// import { gmail_v1 } from "googleapis";
// import { getGmailInstance } from "./getGmailInstance";
// import { base64Decode } from "./utils";
// import { convert } from "html-to-text";
// import path from "path";
// import fs from "fs/promises";
// import { useSingleFileAuthState } from "@adiwajshing/baileys";
