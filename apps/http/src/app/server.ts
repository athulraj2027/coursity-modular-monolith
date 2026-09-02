import http from "http";
import app from "./app";
import { env } from "./config/env";
import { redis } from "@/infrastructure/redis/redis.client";

const server = http.createServer(app);

const startServer = async () => {
    try {
        // Initialize Redis connection
        if (redis.status === "wait") {
            await redis.connect().catch((err) => {
                console.warn(`⚠️ Redis connection failed on startup: ${err?.message || err || "Could not connect"}`);
            });
        }

        server.listen(env.PORT, () => {
            console.log(`\n🚀 Server running on http://localhost:${env.PORT}`);
            console.log(`🌍 Environment: ${env.NODE_ENV}\n`);
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
};

const shutdown = () => {
    console.log("\n🛑 Server shutting down gracefully...");
    server.close(async () => {
        try {
            if (redis.status === "ready" || redis.status === "connect") {
                await redis.quit();
                console.log("📦 Redis disconnected");
            }
        } catch (e) {
            // ignore
        }
        console.log("✅ Server closed");
        process.exit(0);
    });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

startServer();
