import { PrismaClient, Prisma } from "@prisma/client";
import defaultPrisma from "@/infrastructure/database/prisma.client";

export async function seedStandardOffers(prisma: PrismaClient = defaultPrisma) {
  console.log("🌱 Seeding standard promotional default offers...");

  // Fetch standard plans to link offers
  const proPlan = await prisma.plan.findUnique({ where: { slug: "pro-educator" } });
  const elitePlan = await prisma.plan.findUnique({ where: { slug: "elite-academy" } });

  const existingCount = await prisma.offer.count();
  if (existingCount > 0) {
    console.log(`📦 Promotional offers already present in database (${existingCount} found).`);
    return;
  }

  // 1. Launch Celebration Offer (30% off Pro & Elite)
  const launchOffer = await prisma.offer.create({
    data: {
      title: "Launch Celebration Offer",
      description: "Get 30% off your instructor plan subscription during our official launch season.",
      discountType: "PERCENTAGE",
      discountValue: new Prisma.Decimal(30),
      maxDiscountAmount: new Prisma.Decimal(2000),
      minOrderAmount: new Prisma.Decimal(1000),
      eligibility: "ALL_TEACHERS",
      badgeText: "30% OFF LAUNCH SPECIAL",
      maxRedemptions: 500,
      maxRedemptionsPerUser: 1,
      validFrom: new Date(Date.now() - 24 * 60 * 60 * 1000),
      validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      isActive: true,
      applicablePlans: {
        create: [
          ...(proPlan ? [{ planId: proPlan.id }] : []),
          ...(elitePlan ? [{ planId: elitePlan.id }] : []),
        ],
      },
    },
  });

  // 2. New Instructor Boost (Flat ₹500 off for first-time instructors on Pro)
  if (proPlan) {
    await prisma.offer.create({
      data: {
        title: "New Instructor Welcome Discount",
        description: "Special ₹500 introductory savings for first-time educators joining Coursity.",
        discountType: "FLAT",
        discountValue: new Prisma.Decimal(500),
        minOrderAmount: new Prisma.Decimal(1000),
        eligibility: "NEW_TEACHERS_ONLY",
        badgeText: "₹500 WELCOME DISCOUNT",
        maxRedemptions: 1000,
        maxRedemptionsPerUser: 1,
        validFrom: new Date(Date.now() - 24 * 60 * 60 * 1000),
        validUntil: null,
        isActive: true,
        applicablePlans: {
          create: [{ planId: proPlan.id }],
        },
      },
    });
  }

  console.log(`✅ Successfully seeded default promotional offers!`);
}

export async function seedOffersIfEmpty(prisma: PrismaClient = defaultPrisma) {
  try {
    const existingCount = await prisma.offer.count();
    if (existingCount === 0) {
      console.log("⚡ No promotional offers found. Initializing default offers auto-seed...");
      await seedStandardOffers(prisma);
    }
  } catch (error) {
    console.error("❌ Failed to auto-seed promotional offers on startup:", error);
  }
}
