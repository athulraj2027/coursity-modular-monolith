import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
    JWT_REFRESH_SECRET: z.string().optional(),
    JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
    JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
    GOOGLE_CLIENT_ID: z.string().optional().default(""),
    GOOGLE_CLIENT_SECRET: z.string().optional().default(""),
    GOOGLE_REDIRECT_URI: z.string().optional().default("http://localhost:3000/api/auth/google/callback"),
    FRONTEND_URL: z.string().optional().default("http://localhost:5173"),
    REDIS_URL: z.string().default("redis://localhost:6379"),

    // Email / SMTP Configuration
    SMTP_HOST: z.string().optional().default("smtp.gmail.com"),
    SMTP_PORT: z.coerce.number().default(587),
    SMTP_USER: z.string().optional().default(""),
    SMTP_PASS: z.string().optional().default(""),
    SMTP_SECURE: z
        .preprocess((val) => val === "true" || val === true || val === "1", z.boolean().optional())
        .default(false),
    EMAIL_FROM: z.string().default("Coursity <noreply@coursity.com>"),
    ENABLE_IN_PROCESS_WORKER: z
        .preprocess((val) => (val === undefined ? true : val === "true" || val === true || val === "1"), z.boolean().optional())
        .default(true),
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