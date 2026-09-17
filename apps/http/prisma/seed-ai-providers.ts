import { PrismaClient } from "@prisma/client";
import { seedDefaultAIProviders } from "../src/modules/ai-config/infrastructure/seed/default-ai-providers.seed";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding standard AI Providers (Gemini, OpenAI, Anthropic, Deepgram, ElevenLabs, Groq) and Models...");
  await seedDefaultAIProviders(prisma);
  console.log("✅ Standard AI Providers and Models seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding AI providers:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
