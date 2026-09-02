import { CorsOptions } from "cors";
import { env } from "./env";

const allowedOrigins: string[] = [
    env.FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://localhost:4173",
].filter(Boolean);

export const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (such as mobile apps, Postman, curl, or server-to-server)
        if (!origin) {
            return callback(null, true);
        }

        // In development mode, permit localhost and 127.0.0.1 origins on any port
        if (env.NODE_ENV === "development") {
            if (
                origin.startsWith("http://localhost:") ||
                origin.startsWith("http://127.0.0.1:") ||
                allowedOrigins.includes(origin)
            ) {
                return callback(null, true);
            }
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Accept",
        "Origin",
    ],
    exposedHeaders: ["Set-Cookie", "Authorization"],
    maxAge: 86400, // 24 hours
    optionsSuccessStatus: 204,
};

export default corsOptions;
