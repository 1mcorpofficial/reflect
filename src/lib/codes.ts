import crypto from "crypto";

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomString(length: number) {
  const bytes = crypto.randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += alphabet[bytes[i] % alphabet.length];
  }
  return result;
}

export function generateGroupCode() {
  return randomString(6);
}

export function generatePersonalCode() {
  return randomString(8);
}

