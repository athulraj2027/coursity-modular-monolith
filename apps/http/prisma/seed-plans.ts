import { PrismaClient, FeatureType, FeatureCategory } from "@prisma/client"

const prisma = new PrismaClient()

/**
 * Standard dynamic features catalog.
 * These represent the platform capabilities and quota types that admins can allocate
 * to custom subscription plans they create in the Admin Console.
 */
const STANDARD_FEATURES = [
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
]

async function main() {
  console.log("🌱 Seeding Feature Catalog (No pre-built plans)...")

  for (const feat of STANDARD_FEATURES) {
    await prisma.feature.upsert({
      where: { code: feat.code },
      update: {
        name: feat.name,
        description: feat.description,
        featureType: feat.featureType,
        category: feat.category,
        unit: feat.unit,
        sortOrder: feat.sortOrder,
      },
      create: feat,
    })
  }

  console.log(`✅ Upserted ${STANDARD_FEATURES.length} catalog features. Ready for custom plan creation!`)
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
