import mongoose from "mongoose";
import mongodb from "mongodb";

export function binaryToBuffer(binary: any) {
  if (Buffer.isBuffer(binary)) return binary;

  if (!binary || !binary.value || typeof binary.value !== "function")
    return undefined;

  const arr = Array.from(binary.value()).map((b: any) => b.charCodeAt(0));

  return Buffer.from(arr);
}

export function replaceBinaryWithBuffer(obj: any) {
  if (obj instanceof mongoose.Types.ObjectId) return obj;

  if (obj === null || obj === undefined) return obj;

  if (Buffer.isBuffer(obj)) return obj;

  if (Array.isArray(obj)) {
    return obj.map((v) => replaceBinaryWithBuffer(v));
  }

  if (typeof obj === "object") {
    if (obj?._bsontype === "Binary") {
      return binaryToBuffer(obj);
    }

    return Object.keys(obj).reduce((acc, key) => {
      acc[key] = replaceBinaryWithBuffer(obj[key]);
      return acc;
    }, {});
  }

  return obj;
}
