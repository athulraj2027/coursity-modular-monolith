import { PrismaClient } from "@prisma/client";
import { seedStandardPlans } from "../src/modules/plan/infrastructure/seed/default-plans.seed";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding standard subscription plans and catalog features...");
  await seedStandardPlans(prisma);
  console.log("✅ Standard subscription plans and features seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

