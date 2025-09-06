import crypto from "crypto";
import { config } from "../config/env.config.js";

const algorithm = 'aes-256-cbc';
// eslint-disable-next-line no-undef
const key = Buffer.from(config.ENCRYPTION_KEY, 'hex'); // 32 bytes key
const iv = crypto.randomBytes(16); // initialization vector


export function JWTSecretencrypt(text) {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(JSON.stringify(text), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted; // prepend iv for decryption
}

export function JWTencryptToDecrypt(encryptedText) {
  const [ivHex, encrypted] = encryptedText.split(':');
  // eslint-disable-next-line no-undef
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return JSON.parse(decrypted); // original plaintext string
}
















