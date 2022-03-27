export const base64Decode = (data: string) =>
  Buffer.from(data, "base64").toString("ascii");
