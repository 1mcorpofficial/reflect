import crypto from "crypto";

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET not set");
  return secret;
}

export function hmacLookup(input: string) {
  return crypto.createHmac("sha256", getSecret()).update(input).digest("hex");
}

