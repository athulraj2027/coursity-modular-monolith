import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import path from "path";
import fs from "fs";

import router from "./routes";
import { internalInterviewRouter } from "@/modules/interview";
import { internalAIConfigRouter } from "@/modules/ai-config";
import { corsOptions } from "./config/cors";
import errorMiddleware from "./middlewares/err.middleware";
import notFoundMiddleware from "./middlewares/not-found.middleware";
import { globalRateLimiter } from "./middlewares/rate-limit.middleware";

const app = express();

// Ensure local uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
    try {
        fs.mkdirSync(uploadsDir, { recursive: true });
    } catch {
        // ignore
    }
}

// 1. CORS Configuration & Preflight
app.use(cors(corsOptions));

// 2. Serve static uploaded files locally
app.use("/uploads", express.static(uploadsDir));

// 3. Body & Cookie Parsing Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Health check endpoint (for Docker, load balancers, and monitoring)
app.get("/health", (_req, res) => {
    res.status(200).json({
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

// 4. Internal Microservice Routes (secured via x-internal-secret, exempt from client rate limiters)
app.use("/internal/interviews", internalInterviewRouter);
app.use("/internal/ai-config", internalAIConfigRouter);

// 5. Client API Routes (protected by global rate limiter)
app.use("/api", globalRateLimiter, router);

// 5. Fallback Error & Not Found Handlers
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
