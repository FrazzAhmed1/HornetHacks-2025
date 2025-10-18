import crypto from "crypto";
import dotenv from "dotenv";

// Load environment variables (in case this file runs first)
dotenv.config();

if (!process.env.ENCRYPTION_KEY) {
  console.error("❌ Missing ENCRYPTION_KEY in .env file");
  process.exit(1);
}

// Derive a 32-byte key from the env key
const key = crypto.scryptSync(process.env.ENCRYPTION_KEY, "salt", 32);

// Static initialization vector (for simplicity)
const iv = Buffer.alloc(16, 0);

// Encrypt text using AES-256-CTR
export const encrypt = (text) => {
  const cipher = crypto.createCipheriv("aes-256-ctr", key, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  return encrypted.toString("hex");
};

// Decrypt text back to plaintext
export const decrypt = (encryptedText) => {
  const decipher = crypto.createDecipheriv("aes-256-ctr", key, iv);
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedText, "hex")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
};
