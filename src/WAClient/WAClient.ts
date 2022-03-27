import makeWASocket, {
  WASocket,
  DisconnectReason,
  SocketConfig,
  ConnectionState,
  BaileysEventMap,
  AuthenticationCreds,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
} from "@adiwajshing/baileys";
import { Logger, LoggerOptions } from "pino";
import WLogger from "../utils/logger";
import { IAuthStrategy } from "./AuthStrategy";

type HandlerMapType = Partial<
  Record<keyof BaileysEventMap<AuthenticationCreds>, Function>
>;

export interface WAClientConfig {
  sockOptions?: Partial<Omit<SocketConfig, "version" | "auth">>;
  authStrategy: IAuthStrategy;
}

export default class WAClient {
  private sock: WASocket;
  private handlers: HandlerMapType = {};
  private socketListeners: ((sock: WASocket) => void)[] = [];
  private store = makeInMemoryStore({});

  constructor(
    private config: WAClientConfig,
    private logger: Logger<LoggerOptions> = WLogger
  ) {
    this.createSocket();
  }

  public get socket() {
    return this.sock;
  }

  public async onSocketChange(cb: (sock: WASocket) => void) {
    this.socketListeners.push(cb);
  }

  public async addHandler<T extends keyof BaileysEventMap<AuthenticationCreds>>(
    event: T,
    handler: (args: BaileysEventMap<AuthenticationCreds>[T]) => void
  ) {
    this.handlers[event] = handler;
    this.logger.debug(handler, `Adding handler for ${event}`);

    if (this.sock) {
      this.sock.ev.addListener(event, handler);
    }
  }

  public async waitForConnection(timeout: number = 10_000) {
    return new Promise(async (resolve, reject) => {
      const timer = setTimeout(() => {
        this.logger.error("Timedout while waiting for connection");
        reject(new Error("Timedout while waiting for connection"));
      }, timeout);

      this.logger.debug("Waiting for socket");
      while (!this.sock) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      this.logger.debug("Socket has been created");
      clearTimeout(timer);
      resolve(true);
    });
  }

  private async createSocket() {
    const { version, isLatest } = await fetchLatestBaileysVersion();

    if (!isLatest) {
      this.logger.warn(`Using WA v${version.join(".")}, isLatest: ${isLatest}`);
    }

    await this.config.authStrategy.init();

    this.sock = makeWASocket({
      ...this.config.sockOptions,
      version,
      logger: this.logger,
      auth: this.config.authStrategy.getCreds(),
    });

    this.store.bind(this.sock.ev);

    this.logger.debug(`Adding handler for creds.update`);
    this.sock.ev.addListener("creds.update", async (args) => {
      await this.config.authStrategy.saveCreds(args);
    });

    this.logger.debug(`Adding handler for connection.update`);
    this.sock.ev.addListener("connection.update", (args) => {
      this.handleConnectionUpdate(args);
    });

    for (const event in this.handlers) {
      this.logger.debug(`Adding handler for ${event}`, this.handlers[event]);
      this.sock.ev.addListener(event, this.handlers[event]);
    }

    this.socketListeners.forEach((cb) => cb(this.sock));
  }

  private async handleConnectionUpdate({
    connection,
    lastDisconnect,
  }: Partial<ConnectionState>) {
    if (connection === "open") {
      this.logger.info("Connection has been opened");
    } else if (connection === "close") {
      this.logger.info("Connection has been closed");

      if (lastDisconnect) {
        this.logger.info(lastDisconnect, `Disconnect reason`);
      }

      if ((lastDisconnect.error as any) !== DisconnectReason.loggedOut) {
        this.logger.info("Attempting to reconnect");
        this.createSocket();
      }
    }
  }
}
