import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const algorithm = process.env.AES_ALGORITHM;
const key = Buffer.from(process.env.AES_KEY, "hex");
const ivLength = parseInt(process.env.AES_IV_LENGTH);

function encrypt(text) {
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return { encryptedData: encrypted, iv: iv.toString("hex") };
}

function decrypt(encryptedData, ivHex) {
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export default { encrypt, decrypt };