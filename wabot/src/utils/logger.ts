import pino from "pino";

const WLogger = pino({ level: process.env.LOG_LEVEL || "info" });

export default WLogger;
