import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
    REDIS_URL: z.string().default("redis://localhost:6379"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error("\n❌ [Config Error] Invalid or missing environment variables:\n");
    for (const issue of parsedEnv.error.issues) {
        const path = issue.path.join(".") || "root";
        console.error(`  • ${path}: ${issue.message}`);
    }
    console.error("\nPlease check your .env file and ensure all required variables are set.\n");
    process.exit(1);
}

export const env = parsedEnv.data;
export type Env = z.infer<typeof envSchema>;