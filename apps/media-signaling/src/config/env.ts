import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(5001),
  HOST: z.string().default("0.0.0.0"),
  SERVICE_NAME: z.string().default("media-signaling"),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  JWT_SECRET: z.string().min(8, "JWT_SECRET must be at least 8 characters"),
  
  // Expirations & timeouts
  JOIN_TOKEN_EXPIRES_IN_SECONDS: z.coerce.number().default(300),
  ROOM_TTL_SECONDS: z.coerce.number().default(14400),
  HEARTBEAT_TIMEOUT_MS: z.coerce.number().default(15000),
  
  // Core Domain API
  CORE_BACKEND_URL: z.string().default("http://localhost:3000"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables for media-signaling:\n", parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
