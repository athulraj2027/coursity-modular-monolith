import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import router from "./routes";
import { corsOptions } from "./config/cors";
import errorMiddleware from "./middlewares/err.middleware";
import notFoundMiddleware from "./middlewares/not-found.middleware";
import { globalRateLimiter } from "./middlewares/rate-limit.middleware";

const app = express();

// 1. CORS Configuration & Preflight
app.use(cors(corsOptions));

// 2. Body & Cookie Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 3. Global Rate Limiter
app.use(globalRateLimiter);

// 4. API Routes
app.use("/api", router);

// 5. Fallback Error & Not Found Handlers
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
