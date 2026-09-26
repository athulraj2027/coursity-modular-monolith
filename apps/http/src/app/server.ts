import http from "http";
import app from "./app";
import { env } from "./config/env";
import { redis } from "@/infrastructure/redis/redis.client";
import { startEmailWorker, closeEmailWorker } from "@/infrastructure/email";
import { seedPlansIfEmpty } from "@/modules/plan";
import { seedCategoriesIfEmpty } from "@/modules/category";
import { seedOffersIfEmpty } from "@/modules/offer";

// Trigger reload: lecture module registered at 2026-09-26T13:48:00
const server = http.createServer(app);

const startServer = async () => {
    try {
        // Initialize Redis connection
        if (redis.status === "wait") {
            await redis.connect().catch((err) => {
                console.warn(`⚠️ Redis connection failed on startup: ${err?.message || err || "Could not connect"}`);
            });
        }

        // Initialize background email queue processor
        startEmailWorker();

        // Seed standard subscription plans if no plans exist in the database
        try {
            await seedPlansIfEmpty();
        } catch (seedError) {
            console.error("⚠️ Failed to verify or seed standard plans on startup:", seedError);
        }

        // Seed default promotional offers if none exist in the database
        try {
            await seedOffersIfEmpty();
        } catch (seedError) {
            console.error("⚠️ Failed to verify or seed promotional offers on startup:", seedError);
        }

        // Seed standard category hierarchy if no categories exist in the database
        try {
            await seedCategoriesIfEmpty();
        } catch (seedError) {
            console.error("⚠️ Failed to verify or seed standard categories on startup:", seedError);
        }

        server.listen(env.PORT, () => {
            console.log(`\n🚀 Server running on http://localhost:${env.PORT}`);
            console.log(`🌍 Environment: ${env.NODE_ENV}`);
            console.log(`⚡ Internal microservices enabled (Interview & AI-Config)\n`);
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
            await closeEmailWorker();
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
