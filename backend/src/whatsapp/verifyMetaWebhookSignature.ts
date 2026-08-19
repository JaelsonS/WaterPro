import crypto from "crypto";

export function verifyMetaWebhookSignature(params: {
  rawBody: Buffer;
  signatureHeader: string | string[] | undefined;
  appSecret: string;
}): boolean {
  const header = Array.isArray(params.signatureHeader) ? params.signatureHeader[0] : params.signatureHeader;
  if (!header) return false;
  if (!header.startsWith("sha256=")) return false;

  const receivedHex = header.slice("sha256=".length);
  const expectedHex = crypto
    .createHmac("sha256", params.appSecret)
    .update(params.rawBody)
    .digest("hex");

  if (receivedHex.length !== expectedHex.length) return false;

  return crypto.timingSafeEqual(Buffer.from(receivedHex, "hex"), Buffer.from(expectedHex, "hex"));
}

