import crypto from "crypto";
import fs from "fs";
import path from "path";
import { ISecretsStorageService } from "../../domain/services/ai-config.services.interfaces";

export class AesEncryptedSecretStorage implements ISecretsStorageService {
  private readonly algorithm = "aes-256-gcm";
  private readonly masterKey: Buffer;
  private readonly storageFilePath: string;
  private cache: Map<string, string> = new Map(); // referenceKey -> iv:authTag:ciphertext

  constructor(masterSecretKey?: string, customStorageDir?: string) {
    const rawSecret =
      masterSecretKey ||
      process.env.ENCRYPTION_MASTER_KEY ||
      process.env.INTERNAL_SERVICE_SECRET ||
      "coursity_prod_master_secret_encryption_key_2026";

    // Deterministically derive a 32-byte key using SHA-256
    this.masterKey = crypto.createHash("sha256").update(rawSecret).digest();

    const baseDir = customStorageDir || path.join(process.cwd(), "scratch", ".secure_secrets");
    if (!fs.existsSync(baseDir)) {
      try {
        fs.mkdirSync(baseDir, { recursive: true });
      } catch {
        // ignore
      }
    }
    this.storageFilePath = path.join(baseDir, "encrypted_vault.json");
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    try {
      if (fs.existsSync(this.storageFilePath)) {
        const data = fs.readFileSync(this.storageFilePath, "utf8");
        const parsed = JSON.parse(data);
        for (const [key, val] of Object.entries(parsed)) {
          if (typeof val === "string") {
            this.cache.set(key, val);
          }
        }
      }
    } catch {
      // ignore on error, starts fresh
    }
  }

  private saveToDisk(): void {
    try {
      const obj: Record<string, string> = {};
      for (const [key, val] of this.cache.entries()) {
        obj[key] = val;
      }
      fs.writeFileSync(this.storageFilePath, JSON.stringify(obj, null, 2), "utf8");
    } catch {
      // ignore
    }
  }

  async storeSecret(secretReference: string, secretValue: string): Promise<void> {
    if (!secretValue) {
      throw new Error("Cannot store empty secret value");
    }

    // 12-byte initialization vector for AES-GCM
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(this.algorithm, this.masterKey, iv);

    let ciphertext = cipher.update(secretValue, "utf8", "hex");
    ciphertext += cipher.final("hex");

    const authTag = cipher.getAuthTag().toString("hex");
    const payload = `${iv.toString("hex")}:${authTag}:${ciphertext}`;

    this.cache.set(secretReference, payload);
    this.saveToDisk();
  }

  async getSecret(secretReference: string): Promise<string | null> {
    const payload = this.cache.get(secretReference);
    if (!payload) {
      return null;
    }

    try {
      const [ivHex, authTagHex, ciphertextHex] = payload.split(":");
      if (!ivHex || !authTagHex || !ciphertextHex) {
        return null;
      }

      const iv = Buffer.from(ivHex, "hex");
      const authTag = Buffer.from(authTagHex, "hex");
      const decipher = crypto.createDecipheriv(this.algorithm, this.masterKey, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(ciphertextHex, "hex", "utf8");
      decrypted += decipher.final("utf8");

      return decrypted;
    } catch {
      return null;
    }
  }

  async deleteSecret(secretReference: string): Promise<boolean> {
    const removed = this.cache.delete(secretReference);
    if (removed) {
      this.saveToDisk();
    }
    return removed;
  }
}
