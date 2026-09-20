import { PrismaClient } from "@prisma/client";
import { seedStandardCategories } from "../src/modules/category/infrastructure/seed/default-categories.seed";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding standard platform categories and subcategories...");
  await seedStandardCategories(prisma);
  console.log("✅ Standard platform categories seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding categories failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
