import { PrismaClient, DiscountType, OfferEligibility } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding sample promotional offers and promo codes...");

  // 1. Fetch available plans to optionally link
  const plans = await prisma.plan.findMany();
  const proPlan = plans.find((p) => p.slug.includes("pro") || p.slug.includes("educator"));
  const starterPlan = plans.find((p) => p.slug.includes("starter"));

  // 2. Sample Offers
  const sampleOffers = [
    {
      code: "WELCOME50",
      title: "Welcome New Educators - 50% Off",
      description: "Get 50% discount on your first subscription purchase as a newly verified teacher.",
      discountType: DiscountType.PERCENTAGE,
      discountValue: 50.0,
      maxDiscountAmount: 2500.0,
      minOrderAmount: 999.0,
      eligibility: OfferEligibility.NEW_TEACHERS_ONLY,
      isAutoApplied: false,
      badgeText: "50% OFF NEW TEACHER",
      maxRedemptions: 500,
      maxRedemptionsPerUser: 1,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
      isActive: true,
    },
    {
      code: "EARLYBIRD",
      title: "Early Bird Launch Special - Flat ₹1,000 Off",
      description: "Flat ₹1,000 discount across all subscription tiers for early adopter educators.",
      discountType: DiscountType.FLAT,
      discountValue: 1000.0,
      maxDiscountAmount: null,
      minOrderAmount: 1999.0,
      eligibility: OfferEligibility.ALL_TEACHERS,
      isAutoApplied: false,
      badgeText: "FLAT ₹1,000 OFF",
      maxRedemptions: 200,
      maxRedemptionsPerUser: 1,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
    {
      code: "PROEDUCATOR20",
      title: "Pro Educator Tier Special - 20% Off",
      description: "Exclusive 20% discount on the Pro Educator tier.",
      discountType: DiscountType.PERCENTAGE,
      discountValue: 20.0,
      maxDiscountAmount: 1500.0,
      minOrderAmount: 0.0,
      eligibility: OfferEligibility.ALL_TEACHERS,
      isAutoApplied: false,
      badgeText: "20% OFF PRO TIER",
      maxRedemptions: 300,
      maxRedemptionsPerUser: 2,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
      isActive: true,
      applicablePlanId: proPlan?.id,
    },
    {
      code: null, // Auto-applied banner campaign
      title: "Flash Launch Campaign - 15% Off All Plans",
      description: "Limited-time automated discount applied directly to checkout for the launch week.",
      discountType: DiscountType.PERCENTAGE,
      discountValue: 15.0,
      maxDiscountAmount: 1000.0,
      minOrderAmount: 500.0,
      eligibility: OfferEligibility.ALL_TEACHERS,
      isAutoApplied: true,
      badgeText: "🔥 15% AUTO DISCOUNT",
      maxRedemptions: null,
      maxRedemptionsPerUser: 1,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  ];

  for (const offerData of sampleOffers) {
    const { applicablePlanId, ...data } = offerData;

    let existing = null;
    if (data.code) {
      existing = await prisma.offer.findUnique({ where: { code: data.code } });
    } else {
      existing = await prisma.offer.findFirst({ where: { title: data.title } });
    }

    if (!existing) {
      const createdOffer = await prisma.offer.create({
        data: {
          ...data,
          applicablePlans: applicablePlanId
            ? {
                create: {
                  planId: applicablePlanId,
                },
              }
            : undefined,
        },
      });
      console.log(`  ✅ Created offer: ${createdOffer.title} (${createdOffer.code || "AUTO-APPLIED"})`);
    } else {
      console.log(`  ℹ️ Offer already exists: ${existing.title}`);
    }
  }

  console.log("✨ Offers seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding offers:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
