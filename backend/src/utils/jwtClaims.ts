export type JwtPayloadSubset = {
  sub?: string;
  aal?: string;
  amr?: Array<{ method?: string; timestamp?: number }>;
  exp?: number;
};

export function decodeJwtPayload(accessToken: string): JwtPayloadSubset | null {
  const parts = accessToken.split(".");
  if (parts.length < 2) return null;

  try {
    const payloadJson = Buffer.from(parts[1]!, "base64url").toString("utf8");
    return JSON.parse(payloadJson) as JwtPayloadSubset;
  } catch {
    return null;
  }
}

export function getJwtAal(accessToken: string): "aal1" | "aal2" {
  const payload = decodeJwtPayload(accessToken);
  return payload?.aal === "aal2" ? "aal2" : "aal1";
}
