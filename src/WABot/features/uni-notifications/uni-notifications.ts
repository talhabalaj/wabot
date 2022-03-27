import { proto } from "@adiwajshing/baileys";
import { gmail_v1, google } from "googleapis";
import moment from "moment";
import {
  FeatureStore,
  FeatureStoreModel,
} from "../../../database/FeatureStore";
import { SubscriptionModel } from "../../../database/Subscription";
import { ThirdPartyAuthModel } from "../../../database/ThirdPathAuth";
import { base64Decode } from "../../../utils";
import { BaseWAFeature } from "../../WABotFeature";
import { convert } from "html-to-text";

export class UniNotificationFeature extends BaseWAFeature {
  private gmail: gmail_v1.Gmail;
  private static featureName = "uni_notifications";

  constructor(private account: string) {
    super();
    this.setUpGmail();
  }

  private async setUpGmail() {
    const auth = await ThirdPartyAuthModel.findOne({
      name: this.account,
      type: "gmail",
    });

    if (!auth) {
      return this.logger.error("Auth not found for gmail: " + this.account);
    }

    const { creds } = auth;

    if (!creds) {
      return this.logger.error("Creds not found for gmail: " + this.account);
    }

    const client = new google.auth.OAuth2({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    });

    client.setCredentials(creds);

    this.gmail = google.gmail({ version: "v1", auth: client });

    this.listenForNewMessages();
  }

  private async listenForNewMessages() {
    try {
      let featureStoreRecord = await FeatureStoreModel.findOne({
        name: UniNotificationFeature.featureName,
      });

      if (!featureStoreRecord) {
        featureStoreRecord = await FeatureStoreModel.create({
          name: UniNotificationFeature.featureName,
          store: {
            lastUpdateTime: moment().subtract({ month: 1 }).toDate(),
          },
        });

        this.logger.debug(
          featureStoreRecord,
          "Created feature Store record, as it didn't exist"
        );
      }

      const subscribers = await SubscriptionModel.find({
        name: UniNotificationFeature.featureName,
        jid: { $ne: "" },
      });

      this.logger.debug(subscribers, "Got subscribers");

      if (subscribers.length > 0) {
        const { store } = featureStoreRecord;
        let { lastUpdateTime } = store;
        lastUpdateTime = Date.parse(lastUpdateTime);
        const query = `after:${moment(lastUpdateTime).format("YYYY/M/D")} ${
          store.filter ? store.filter : ""
        }`;

        this.logger.info(
          { query },
          "Fetching message history for " + this.account
        );

        const messages = await this.gmail.users.messages.list({
          userId: "me",
          q: query,
        });

        featureStoreRecord.store.lastUpdateTime = new Date();

        this.logger.debug(messages, "Got messages");

        if (messages.data.resultSizeEstimate > 0) {
          for (const message of messages.data.messages) {
            const messageDownloadedData = await this.downloadEmail(message.id);

            this.logger.trace(
              {
                text: messageDownloadedData.text,
                internalDate: messageDownloadedData.internalDate || "UNDEFINED",
                isNew: messageDownloadedData.internalDate > lastUpdateTime,
                lastUpdateTime: lastUpdateTime,
              },
              "Got message data for " + message.id
            );

            if (
              messageDownloadedData &&
              messageDownloadedData.internalDate > lastUpdateTime
            ) {
              const { text, attachments } = messageDownloadedData;

              if (text) {
                for (const subscriber of subscribers) {
                  this.logger.trace(
                    { subscriber, text },
                    "Sending message to subscriber"
                  );
                  await this.socket.sendMessage(subscriber.jid, {
                    text,
                  });
                }
              } else {
                this.logger.error("No text found in message");
              }

              if (attachments.length > 0) {
                for (const subscriber of subscribers) {
                  this.logger.trace(
                    { attachments, text },
                    "Sending message to attachments"
                  );
                  for (const attachment of attachments) {
                    await this.socket.sendMessage(subscriber.jid, {
                      document: attachment.buffer,
                      mimetype: attachment.mimeType,
                      fileName: attachment.filename,
                    });
                  }
                }
              }
            }
          }
        }

        this.logger.trace(
          { store: featureStoreRecord.store },
          "Updating feature store record with new Time"
        );

        await FeatureStoreModel.updateOne(
          { name: UniNotificationFeature.featureName },
          featureStoreRecord
        );
      } else {
        this.logger.debug("No subscribers, stoping");
      }
    } catch (e) {
      this.logger.error(e, "Error while listening for new messages");
    } finally {
      setTimeout(() => {
        this.listenForNewMessages();
      }, 1000 * 60 * 5);
    }
  }

  private async downloadEmail(messageId: string) {
    this.logger.debug({ messageId }, "Downloading email");

    const message = (
      await this.gmail.users.messages.get({
        id: messageId,
        userId: "me",
      })
    ).data;

    this.logger.trace({ message }, "Downloaded email");

    let email: {
      text: string;
      attachments: {
        buffer: Buffer;
        filename: string;
        mimeType: string;
      }[];
      internalDate: number;
    } = {
      text: "",
      attachments: [],
      internalDate: Number(message.internalDate),
    };

    if (!message.payload.parts) {
      this.logger.error(message, "No parts found");
      return;
    }

    for (const part of message.payload.parts) {
      const isMessage = part.filename === "";

      if (isMessage) {
        email.text =
          email.text === ""
            ? part.mimeType === "text/plain"
              ? base64Decode(part.body.data)
              : part.mimeType === "text/html"
              ? convert(base64Decode(part.body.data))
              : email.text
            : email.text;
      } else {
        const downloadedAttachment =
          await this.gmail.users.messages.attachments.get({
            id: part.body.attachmentId,
            messageId: message.id,
            userId: "me",
          });

        const buffer = Buffer.from(downloadedAttachment.data.data, "base64");

        email.attachments.push({
          buffer,
          filename: part.filename,
          mimeType: part.mimeType,
        });
      }
    }

    return email;
  }

  public async onNewMessage(message: proto.IWebMessageInfo) {
    if (
      !message?.message ||
      (!message.message.conversation &&
        !message.message.extendedTextMessage?.text)
    )
      return;

    const text =
      message.message.conversation || message.message.extendedTextMessage?.text;

    if (text.startsWith(`pls sub ${UniNotificationFeature.featureName}`)) {
      try {
        await SubscriptionModel.create({
          jid: message.key.remoteJid,
          name: UniNotificationFeature.featureName,
        });
        await this.socket.sendMessage(message.key.remoteJid, {
          text: `You are now subscribed to ${UniNotificationFeature.featureName}`,
        });
      } catch (e) {
        await this.socket.sendMessage(message.key.remoteJid, {
          text: `You are already subscribed to ${UniNotificationFeature.featureName}`,
        });
      }
    }
  }
}
