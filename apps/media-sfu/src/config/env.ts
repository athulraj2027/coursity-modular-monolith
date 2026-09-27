import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(5000),
  NODE_ID: z.string().default(`media-node-${process.pid}`),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  JWT_SECRET: z.string().min(8, "JWT_SECRET must be at least 8 characters"),
  
  // Mediasoup Worker & RTC Settings
  MEDIASOUP_NUM_WORKERS: z.coerce.number().default(0), // 0 = os.cpus().length
  MEDIASOUP_LOG_LEVEL: z.enum(["debug", "warn", "error", "none"]).default("warn"),
  RTC_MIN_PORT: z.coerce.number().default(20000),
  RTC_MAX_PORT: z.coerce.number().default(20100),
  MEDIASOUP_LISTEN_IP: z.string().default("0.0.0.0"),
  MEDIASOUP_ANNOUNCED_IP: z.string().default("127.0.0.1"),
  
  // Heartbeat & Reporting
  HEARTBEAT_INTERVAL_MS: z.coerce.number().default(5000),
  CORE_BACKEND_URL: z.string().default("http://localhost:3000"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables for media-sfu:\n", parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
