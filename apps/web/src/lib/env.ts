import { z } from "zod"

const envSchema = z.object({
  VITE_API_URL: z
    .string()
    .min(1, "VITE_API_URL is required")
    .default("http://localhost:3000/api"),
  VITE_APP_NAME: z.string().default("Coursity"),
  VITE_APP_URL: z.string().default("http://localhost:5173"),
  VITE_ENABLE_DEVTOOLS: z
    .string()
    .optional()
    .transform((val) => val === "true" || val === "1")
    .default(true),
  MODE: z.string().default("development"),
  DEV: z.boolean().default(true),
  PROD: z.boolean().default(false),
})

const parsed = envSchema.safeParse({
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
  VITE_APP_URL: import.meta.env.VITE_APP_URL,
  VITE_ENABLE_DEVTOOLS: import.meta.env.VITE_ENABLE_DEVTOOLS,
  MODE: import.meta.env.MODE,
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
})

if (!parsed.success) {
  console.error(
    "❌ [Environment Config Error] Invalid environment variables:",
    parsed.error.format()
  )
  throw new Error("Invalid frontend environment configuration")
}

export const env = parsed.data
export type Env = z.infer<typeof envSchema>
export default env
