import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
    PORT: z.coerce.number().optional().default(3000),

    DATABASE_URL: z.string(),

    JWT_SECRET: z.string(),

    REDIS_URL: z.string().optional(),
});

export const env = envSchema.parse(process.env);