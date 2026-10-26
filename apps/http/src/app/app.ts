import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";

import router, { healthRouter } from "./routes";
import { internalInterviewRouter } from "@/modules/interview";
import { internalAIConfigRouter } from "@/modules/ai-config";
import { corsOptions } from "./config/cors";
import errorMiddleware from "./middlewares/err.middleware";
import notFoundMiddleware from "./middlewares/not-found.middleware";
import { globalRateLimiter } from "./middlewares/rate-limit.middleware";

const app = express();

// Local uploads directory for development
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
    try {
        fs.mkdirSync(uploadsDir, { recursive: true });
    } catch { }
}

app.use(cors(corsOptions));
app.use("/uploads", express.static(uploadsDir));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

app.use("/health", healthRouter);

// Internal Microservice Routes
app.use("/internal/interviews", internalInterviewRouter);
app.use("/internal/ai-config", internalAIConfigRouter);
app.use("/api", globalRateLimiter, router);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
