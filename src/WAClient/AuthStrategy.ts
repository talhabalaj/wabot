import {
  AuthenticationCreds,
  AuthenticationState,
  initAuthCreds,
  proto,
  SignalDataTypeMap,
  useSingleFileAuthState,
} from "@adiwajshing/baileys";
import { DocumentType } from "@typegoose/typegoose";
import mongoose from "mongoose";
import { Logger, LoggerOptions } from "pino";
import { AuthClass, AuthModel } from "../database";
import {
  binaryToBuffer,
  replaceBinaryWithBuffer,
} from "../database/utils/binaryToBuffer";
import WLogger from "../utils/logger";

export interface IAuthStrategy {
  init: () => Promise<void> | void;
  getCreds: () => AuthenticationState;
  saveCreds: (creds?: AuthenticationCreds) => Promise<void> | void;
}

export class LocalFileAuthStrategy implements IAuthStrategy {
  private auth: ReturnType<typeof useSingleFileAuthState>;
  private initialized: boolean;

  constructor(
    private filePath: string,
    private logger: Logger<LoggerOptions> = WLogger
  ) {}

  init() {
    if (!this.initialized) {
      this.logger.debug("Initializing local auth strategy");
      this.auth = useSingleFileAuthState(this.filePath, this.logger);
      this.logger.info("Initializing local auth strategy");
      this.initialized = true;
    }
  }

  getCreds() {
    console.log(this.auth.state.creds);
    return this.auth.state;
  }

  saveCreds() {
    this.logger.info("Saving auth state", this.auth.state);
    this.auth.saveState();
  }
}

export class MongoDbAuthStrategy implements IAuthStrategy {
  private initialized: boolean;
  public auth: DocumentType<AuthClass>;

  static KEY_MAP: { [T in keyof SignalDataTypeMap]: string } = {
    "pre-key": "preKeys",
    session: "sessions",
    "sender-key": "senderKeys",
    "app-state-sync-key": "appStateSyncKeys",
    "app-state-sync-version": "appStateVersions",
    "sender-key-memory": "senderKeyMemory",
  };

  constructor(
    private userJid: string,
    private device?: number,
    private logger: Logger<LoggerOptions> = WLogger
  ) {}

  async init() {
    if (this.initialized) return;

    this.logger.debug("Initializing mongodb auth strategy");

    let record = await AuthModel.findOne({
      jid: this.userJid,
      device: this.device,
    }).catch((err) => {
      this.logger.error("Error while fetching auth record", err);
    });

    if (!record) {
      this.logger.debug("Creating new auth record, as it does not exist", {
        jid: this.userJid,
        device: this.device,
      });

      const creds = initAuthCreds();
      console.log(creds);

      record = new AuthModel({
        jid: this.userJid,
        device: this.device,
        authState: {
          creds,
          keys: {},
        },
      });

      await record.save().catch((err) => {
        this.logger.error("Error while creating new auth record", err);
      });
    } else {
      this.logger.debug("Found existing auth record");
    }

    this.logger.info("Initialized mongodb auth strategy");
    this.auth = record;
    this.saveCredsOnline();
    this.initialized = true;
  }

  async saveCredsOnline() {
    await AuthModel.updateOne(
      { _id: this.auth._id },
      { $set: { authState: this.auth.authState } }
    )
      .then(() => {
        this.logger.info("Saved auth state");
        this.logger.trace(this.auth.authState);
      })
      .catch((err) => {
        this.logger.error(err, "Error while saving auth record");
      });
    setTimeout(() => {
      this.saveCredsOnline();
    }, 10_000);
  }

  getCreds(): AuthenticationState {
    const { keys, creds } = this.auth.authState;

    const processedCreds = replaceBinaryWithBuffer(creds);

    this.logger.debug(processedCreds, "Processed creds");

    return {
      creds: processedCreds,
      keys: {
        get: (type, ids) => {
          this.logger.debug({ type, ids }, "Getting keys");
          const key = MongoDbAuthStrategy.KEY_MAP[type];

          return replaceBinaryWithBuffer(
            ids.reduce((dict, id) => {
              let value = (keys as any)[key]?.[id];
              if (value) {
                if (type === "app-state-sync-key") {
                  value = proto.AppStateSyncKeyData.fromObject(value);
                }
                this.logger.debug({ value }, `Settings value of ${key}`);
                dict[id] = value;
              }

              return dict;
            }, {})
          );
        },
        set: (data) => {
          this.logger.debug({ data }, "Settings keys");
          for (const _key in data) {
            const key = MongoDbAuthStrategy.KEY_MAP[_key];
            keys[key] = keys[key] || {};
            if (data[_key] === null) delete keys[key][_key];
            Object.assign(keys[key], data[_key]);
          }
          this.saveCreds();
        },
      },
    };
  }

  async saveCreds(creds?: AuthenticationCreds) {
    this.logger.debug("Saving auth state");
    if (creds) {
      this.auth.authState.creds = { ...this.auth.authState.creds, ...creds };
      this.logger.debug(creds, "Updating creds");
    }
  }
}
