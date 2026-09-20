import { PrismaClient, FeatureType, FeatureCategory, BillingCycle } from "@prisma/client";
import defaultPrisma from "@/infrastructure/database/prisma.client";

/**
 * Standard dynamic features catalog.
 * Represents platform quota limits and capability switches that can be bound to plans.
 */
export const STANDARD_FEATURES: Array<{
  code: string;
  name: string;
  description: string;
  featureType: FeatureType;
  category: FeatureCategory;
  unit: string | null;
  sortOrder: number;
}> = [
  {
    code: "MAX_COURSES",
    name: "Published Courses Limit",
    description: "Maximum number of published and active courses allowed",
    featureType: FeatureType.NUMERIC,
    category: FeatureCategory.COURSES,
    unit: "courses",
    sortOrder: 1,
  },
  {
    code: "MAX_RECORDED_CLASSES",
    name: "Cloud Recorded Classes",
    description: "Maximum number of recorded class sessions stored in cloud",
    featureType: FeatureType.NUMERIC,
    category: FeatureCategory.RECORDING,
    unit: "classes",
    sortOrder: 2,
  },
  {
    code: "LIVE_VIEWER_MINUTES_MONTHLY",
    name: "Live Class Viewer Minutes",
    description: "Monthly viewer minutes (Class Duration in min × Attending Students)",
    featureType: FeatureType.NUMERIC,
    category: FeatureCategory.LIVE_STREAMING,
    unit: "minutes/mo",
    sortOrder: 3,
  },
  {
    code: "MAX_LIVE_CLASSES_PER_WEEK",
    name: "Live Classes per Week",
    description: "Maximum live interactive class sessions permitted per week",
    featureType: FeatureType.NUMERIC,
    category: FeatureCategory.LIVE_STREAMING,
    unit: "classes/wk",
    sortOrder: 4,
  },
  {
    code: "MAX_LIVE_CLASSES_PER_MONTH",
    name: "Live Classes per Month",
    description: "Maximum live interactive class sessions permitted per month",
    featureType: FeatureType.NUMERIC,
    category: FeatureCategory.LIVE_STREAMING,
    unit: "classes/mo",
    sortOrder: 5,
  },
  {
    code: "MAX_STUDENTS_PER_SESSION",
    name: "Max Students per Live Session",
    description: "Concurrent student capacity in live interactive classes",
    featureType: FeatureType.NUMERIC,
    category: FeatureCategory.LIVE_STREAMING,
    unit: "students",
    sortOrder: 6,
  },
  {
    code: "MAX_STORAGE_GB",
    name: "Cloud Video & Asset Storage",
    description: "Dedicated cloud storage capacity for videos, PDFs, and assets",
    featureType: FeatureType.NUMERIC,
    category: FeatureCategory.STORAGE,
    unit: "GB",
    sortOrder: 7,
  },
  {
    code: "HD_RECORDING_1080P",
    name: "1080p FHD Recording & Streaming",
    description: "High-definition 1080p video recording and streaming",
    featureType: FeatureType.BOOLEAN,
    category: FeatureCategory.RECORDING,
    unit: null,
    sortOrder: 8,
  },
  {
    code: "AI_CLASS_SUMMARIES",
    name: "AI Class Summaries & Notes",
    description: "Automated transcription, AI summaries, and smart keyword search",
    featureType: FeatureType.BOOLEAN,
    category: FeatureCategory.ANALYTICS,
    unit: null,
    sortOrder: 9,
  },
  {
    code: "CUSTOM_BRANDED_CERTIFICATES",
    name: "Custom Branded Certificates",
    description: "Issue automated branded completion certificates to graduates",
    featureType: FeatureType.BOOLEAN,
    category: FeatureCategory.COMMUNITY,
    unit: null,
    sortOrder: 10,
  },
];

/**
 * Standard subscription plan tiers.
 */
export const STANDARD_PLANS: Array<{
  name: string;
  slug: string;
  tagline: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  trialDays: number;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  features: Record<string, { value: string; isUnlimited?: boolean }>;
}> = [
  {
    name: "Free Starter",
    slug: "starter",
    tagline: "Everything you need to launch your first cohort and test live teaching",
    description: "Designed for emerging instructors getting started with live sessions and cohort-based teaching.",
    price: 0,
    currency: "USD",
    billingCycle: BillingCycle.MONTHLY,
    trialDays: 0,
    isActive: true,
    isFeatured: false,
    sortOrder: 1,
    features: {
      MAX_COURSES: { value: "2", isUnlimited: false },
      MAX_RECORDED_CLASSES: { value: "5", isUnlimited: false },
      LIVE_VIEWER_MINUTES_MONTHLY: { value: "1000", isUnlimited: false },
      MAX_LIVE_CLASSES_PER_WEEK: { value: "2", isUnlimited: false },
      MAX_LIVE_CLASSES_PER_MONTH: { value: "8", isUnlimited: false },
      MAX_STUDENTS_PER_SESSION: { value: "25", isUnlimited: false },
      MAX_STORAGE_GB: { value: "5", isUnlimited: false },
      HD_RECORDING_1080P: { value: "false", isUnlimited: false },
      AI_CLASS_SUMMARIES: { value: "false", isUnlimited: false },
      CUSTOM_BRANDED_CERTIFICATES: { value: "false", isUnlimited: false },
    },
  },
  {
    name: "Pro Educator",
    slug: "pro-educator",
    tagline: "For active instructors running regular live cohorts and growing their audience",
    description: "Expanded live streaming bandwidth, 1080p recording, AI transcripts, and custom certificates.",
    price: 29,
    currency: "USD",
    billingCycle: BillingCycle.MONTHLY,
    trialDays: 14,
    isActive: true,
    isFeatured: true,
    sortOrder: 2,
    features: {
      MAX_COURSES: { value: "10", isUnlimited: false },
      MAX_RECORDED_CLASSES: { value: "50", isUnlimited: false },
      LIVE_VIEWER_MINUTES_MONTHLY: { value: "15000", isUnlimited: false },
      MAX_LIVE_CLASSES_PER_WEEK: { value: "10", isUnlimited: false },
      MAX_LIVE_CLASSES_PER_MONTH: { value: "40", isUnlimited: false },
      MAX_STUDENTS_PER_SESSION: { value: "100", isUnlimited: false },
      MAX_STORAGE_GB: { value: "50", isUnlimited: false },
      HD_RECORDING_1080P: { value: "true", isUnlimited: false },
      AI_CLASS_SUMMARIES: { value: "true", isUnlimited: false },
      CUSTOM_BRANDED_CERTIFICATES: { value: "true", isUnlimited: false },
    },
  },
  {
    name: "Elite Academy",
    slug: "elite-academy",
    tagline: "Unlimited power for high-volume educators, academies, and professional institutes",
    description: "Unlimited courses, massive student capacities, priority live streaming, and full AI automation.",
    price: 99,
    currency: "USD",
    billingCycle: BillingCycle.MONTHLY,
    trialDays: 14,
    isActive: true,
    isFeatured: false,
    sortOrder: 3,
    features: {
      MAX_COURSES: { value: "-1", isUnlimited: true },
      MAX_RECORDED_CLASSES: { value: "-1", isUnlimited: true },
      LIVE_VIEWER_MINUTES_MONTHLY: { value: "100000", isUnlimited: false },
      MAX_LIVE_CLASSES_PER_WEEK: { value: "50", isUnlimited: false },
      MAX_LIVE_CLASSES_PER_MONTH: { value: "200", isUnlimited: false },
      MAX_STUDENTS_PER_SESSION: { value: "500", isUnlimited: false },
      MAX_STORAGE_GB: { value: "500", isUnlimited: false },
      HD_RECORDING_1080P: { value: "true", isUnlimited: false },
      AI_CLASS_SUMMARIES: { value: "true", isUnlimited: false },
      CUSTOM_BRANDED_CERTIFICATES: { value: "true", isUnlimited: false },
    },
  },
];

/**
 * Seeds standard catalog features and standard subscription plans into the database.
 */
export async function seedStandardPlans(prisma: PrismaClient = defaultPrisma) {
  console.log("🌱 Seeding standard feature catalog and subscription plans...");

  // 1. Upsert Standard Features
  const featureMap = new Map<string, string>(); // code -> id

  for (const feat of STANDARD_FEATURES) {
    const savedFeature = await prisma.feature.upsert({
      where: { code: feat.code },
      update: {
        name: feat.name,
        description: feat.description,
        featureType: feat.featureType,
        category: feat.category,
        unit: feat.unit,
        sortOrder: feat.sortOrder,
      },
      create: {
        code: feat.code,
        name: feat.name,
        description: feat.description,
        featureType: feat.featureType,
        category: feat.category,
        unit: feat.unit,
        sortOrder: feat.sortOrder,
      },
    });
    featureMap.set(savedFeature.code, savedFeature.id);
  }

  // 2. Upsert Standard Plans & Plan Features
  for (const planData of STANDARD_PLANS) {
    const { features: planFeaturesObj, ...planDetails } = planData;

    const plan = await prisma.plan.upsert({
      where: { slug: planDetails.slug },
      update: {
        name: planDetails.name,
        tagline: planDetails.tagline,
        description: planDetails.description,
        price: planDetails.price,
        currency: planDetails.currency,
        billingCycle: planDetails.billingCycle,
        trialDays: planDetails.trialDays,
        isActive: planDetails.isActive,
        isFeatured: planDetails.isFeatured,
        sortOrder: planDetails.sortOrder,
      },
      create: {
        name: planDetails.name,
        slug: planDetails.slug,
        tagline: planDetails.tagline,
        description: planDetails.description,
        price: planDetails.price,
        currency: planDetails.currency,
        billingCycle: planDetails.billingCycle,
        trialDays: planDetails.trialDays,
        isActive: planDetails.isActive,
        isFeatured: planDetails.isFeatured,
        sortOrder: planDetails.sortOrder,
      },
    });

    // Upsert Plan Features
    for (const [featCode, featConfig] of Object.entries(planFeaturesObj)) {
      const featureId = featureMap.get(featCode);
      if (!featureId) continue;

      await prisma.planFeature.upsert({
        where: {
          planId_featureId: {
            planId: plan.id,
            featureId: featureId,
          },
        },
        update: {
          value: featConfig.value,
          isUnlimited: featConfig.isUnlimited ?? false,
        },
        create: {
          planId: plan.id,
          featureId: featureId,
          value: featConfig.value,
          isUnlimited: featConfig.isUnlimited ?? false,
        },
      });
    }
  }

  console.log(
    `✅ Successfully seeded ${STANDARD_FEATURES.length} features and ${STANDARD_PLANS.length} standard plans (Free Starter, Pro Educator, Elite Academy)!`
  );
}

/**
 * Checks if subscription plans exist in the database.
 * If 0 plans are found, seeds the standard dynamic features and standard plans.
 */
export async function seedPlansIfEmpty(prisma: PrismaClient = defaultPrisma) {
  try {
    const existingCount = await prisma.plan.count();

    if (existingCount > 0) {
      console.log(
        `📦 Subscription plans already present in database (${existingCount} found). Skipping auto-seeding.`
      );
      return false;
    }

    console.log("⚡ No subscription plans found in database. Initializing standard plans auto-seed...");
    await seedStandardPlans(prisma);
    return true;
  } catch (error) {
    console.error("❌ Failed to auto-seed standard plans on startup:", error);
    throw error;
  }
}
