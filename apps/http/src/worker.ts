import "dotenv/config";
import { NodemailerTransport } from "./modules/email/infrastructure/transport/nodemailer.transport";
import { EmailWorker } from "./modules/email/infrastructure/queue/email.worker";
import { redis } from "./infrastructure/redis/redis.client";

console.log("\n=======================================================");
console.log("⚙️  [Coursity Background Worker Service] Starting...");
console.log("=======================================================\n");

const transport = new NodemailerTransport();
const worker = new EmailWorker(transport);

const start = async () => {
    try {
        if (redis.status === "wait") {
            await redis.connect().catch((err) => {
                console.warn(`⚠️ Redis connect warning: ${err?.message || err}`);
            });
        }

        worker.start();
        console.log("✅ Standalone Email Worker is ready and listening for jobs.\n");
    } catch (error) {
        console.error("❌ Fatal error starting standalone worker:", error);
        process.exit(1);
    }
};

const shutdown = async () => {
    console.log("\n🛑 Standalone Worker shutting down...");
    try {
        await worker.close();
        if (redis.status === "ready" || redis.status === "connect") {
            await redis.quit();
        }
    } catch (e) {
        // ignore
    }
    console.log("✅ Worker terminated gracefully");
    process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

start();
