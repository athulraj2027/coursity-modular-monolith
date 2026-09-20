import { PrismaClient } from "@prisma/client";
import defaultPrisma from "@/infrastructure/database/prisma.client";

export interface SeedCategoryItem {
  name: string;
  slug: string;
  description: string;
  icon: string;
  image?: string;
  sortOrder: number;
  subcategories: Array<{
    name: string;
    slug: string;
    description: string;
    icon?: string;
    sortOrder: number;
  }>;
}

export const STANDARD_CATEGORIES: SeedCategoryItem[] = [
  {
    name: "Development & Software Engineering",
    slug: "development-software-engineering",
    description: "Master modern web development, backend engineering, cloud systems, mobile apps, and developer tools.",
    icon: "Code2",
    sortOrder: 1,
    subcategories: [
      {
        name: "Frontend Development",
        slug: "frontend-development",
        description: "Modern UI engineering with React, Next.js, Vue, Angular, Svelte, and Tailwind CSS.",
        sortOrder: 1,
      },
      {
        name: "Backend & Microservices",
        slug: "backend-microservices",
        description: "Scalable server architectures with Node.js, Go, Rust, Python, Java, and distributed systems.",
        sortOrder: 2,
      },
      {
        name: "Full Stack Engineering",
        slug: "full-stack-engineering",
        description: "End-to-end web application development, SaaS architecture, and monolithic-to-microservice patterns.",
        sortOrder: 3,
      },
      {
        name: "Mobile App Development",
        slug: "mobile-app-development",
        description: "Cross-platform and native mobile apps with Flutter, React Native, iOS Swift, and Android Kotlin.",
        sortOrder: 4,
      },
      {
        name: "DevOps, CI/CD & SRE",
        slug: "devops-cicd-sre",
        description: "Automated pipelines, Docker containerization, Kubernetes orchestration, and Infrastructure as Code.",
        sortOrder: 5,
      },
      {
        name: "Game Development",
        slug: "game-development",
        description: "Game engines, C++, Unity, Unreal Engine 5, Godot, shader programming, and 3D physics.",
        sortOrder: 6,
      },
      {
        name: "Software Testing & QA",
        slug: "software-testing-qa",
        description: "Automated test suites, end-to-end testing with Playwright, Cypress, Jest, and performance testing.",
        sortOrder: 7,
      },
      {
        name: "Cybersecurity & Ethical Hacking",
        slug: "cybersecurity-ethical-hacking",
        description: "Penetration testing, network security, reverse engineering, and threat modeling.",
        sortOrder: 8,
      },
      {
        name: "Database Design & Management",
        slug: "database-design-management",
        description: "Relational and NoSQL database modeling, PostgreSQL, MongoDB, Redis, and high-performance querying.",
        sortOrder: 9,
      },
    ],
  },
  {
    name: "Artificial Intelligence & Data Science",
    slug: "ai-data-science",
    description: "Explore cutting-edge generative AI, machine learning, data engineering, and intelligent systems.",
    icon: "BrainCircuit",
    sortOrder: 2,
    subcategories: [
      {
        name: "Generative AI & LLMs",
        slug: "generative-ai-llms",
        description: "Large Language Models, Prompt Engineering, LangChain, LlamaIndex, RAG, and fine-tuning.",
        sortOrder: 1,
      },
      {
        name: "Machine Learning & Deep Learning",
        slug: "machine-learning-deep-learning",
        description: "Statistical modeling, PyTorch, TensorFlow, Scikit-learn, and neural network architectures.",
        sortOrder: 2,
      },
      {
        name: "Data Engineering & Pipelines",
        slug: "data-engineering-pipelines",
        description: "Big data pipelines, Apache Spark, Kafka, Snowflake, dbt, Airflow, and data warehousing.",
        sortOrder: 3,
      },
      {
        name: "Data Analytics & Business Intelligence",
        slug: "data-analytics-bi",
        description: "Data visualization, advanced SQL, Power BI, Tableau, and data storytelling.",
        sortOrder: 4,
      },
      {
        name: "Computer Vision & Robotics",
        slug: "computer-vision-robotics",
        description: "OpenCV, object detection, YOLO, image segmentation, and robotics automation.",
        sortOrder: 5,
      },
      {
        name: "Natural Language Processing (NLP)",
        slug: "natural-language-processing",
        description: "Transformer models, semantic search, text classification, speech recognition, and embeddings.",
        sortOrder: 6,
      },
    ],
  },
  {
    name: "Design, UI/UX & Creative Arts",
    slug: "design-creative-arts",
    description: "Craft breathtaking user interfaces, interactive experiences, brand identities, and visual media.",
    icon: "Palette",
    sortOrder: 3,
    subcategories: [
      {
        name: "UI/UX & Product Design",
        slug: "ui-ux-product-design",
        description: "User research, Figma design systems, wireframing, interactive prototyping, and usability testing.",
        sortOrder: 1,
      },
      {
        name: "Graphic Design & Illustration",
        slug: "graphic-design-illustration",
        description: "Adobe Photoshop, Illustrator, vector illustrations, typography, and layout composition.",
        sortOrder: 2,
      },
      {
        name: "3D Modeling & Animation",
        slug: "3d-modeling-animation",
        description: "Blender, Maya, Cinema 4D, ZBrush character sculpting, lighting, and rendering.",
        sortOrder: 3,
      },
      {
        name: "Motion Graphics & VFX",
        slug: "motion-graphics-vfx",
        description: "After Effects motion design, visual effects, title sequences, and kinetic typography.",
        sortOrder: 4,
      },
      {
        name: "Brand Identity & Logo Design",
        slug: "brand-identity-logo-design",
        description: "Logo design, brand strategy, typography pairings, color theory, and visual identity guidelines.",
        sortOrder: 5,
      },
    ],
  },
  {
    name: "Business, Management & Strategy",
    slug: "business-management-strategy",
    description: "Build sustainable companies, manage high-impact products, lead teams, and scale revenue.",
    icon: "Briefcase",
    sortOrder: 4,
    subcategories: [
      {
        name: "Startup & Venture Building",
        slug: "startup-venture-building",
        description: "Ideation, business model canvas, MVP launch, investor pitch decks, and fundraising.",
        sortOrder: 1,
      },
      {
        name: "Product Management",
        slug: "product-management",
        description: "Product discovery, roadmap prioritization, Agile sprints, user stories, and feature metrics.",
        sortOrder: 2,
      },
      {
        name: "Leadership & Executive Management",
        slug: "leadership-management",
        description: "Strategic decision making, team motivation, conflict resolution, and organizational scaling.",
        sortOrder: 3,
      },
      {
        name: "Project Management & Agile Delivery",
        slug: "project-management-agile",
        description: "Scrum Master, Kanban, PMP frameworks, resource allocation, and Jira workflow mastery.",
        sortOrder: 4,
      },
      {
        name: "Sales & B2B Business Development",
        slug: "sales-business-development",
        description: "High-ticket sales, cold outreach, consultative selling, CRM pipelines, and enterprise negotiations.",
        sortOrder: 5,
      },
    ],
  },
  {
    name: "Finance, Accounting & Investing",
    slug: "finance-accounting-investing",
    description: "Master wealth creation, corporate finance, valuation modeling, markets, and crypto economics.",
    icon: "Landmark",
    sortOrder: 5,
    subcategories: [
      {
        name: "Financial Modeling & Valuation",
        slug: "financial-modeling-valuation",
        description: "Discounted Cash Flow (DCF), LBO models, M&A analysis, and financial statement forecasting.",
        sortOrder: 1,
      },
      {
        name: "Personal Finance & Wealth Building",
        slug: "personal-finance-wealth",
        description: "Budgeting, asset allocation, passive index investing, retirement planning, and tax optimization.",
        sortOrder: 2,
      },
      {
        name: "Stock Market & Options Trading",
        slug: "stock-market-options-trading",
        description: "Technical chart analysis, fundamental equity research, risk mitigation, and derivative strategies.",
        sortOrder: 3,
      },
      {
        name: "Crypto, DeFi & Web3 Economics",
        slug: "crypto-defi-web3-economics",
        description: "Cryptocurrency market dynamics, tokenomics, liquidity pools, and decentralized finance protocols.",
        sortOrder: 4,
      },
      {
        name: "Corporate Accounting & Tax Planning",
        slug: "corporate-accounting-tax",
        description: "GAAP/IFRS standards, corporate balance sheets, audit preparation, and business tax structures.",
        sortOrder: 5,
      },
    ],
  },
  {
    name: "Marketing & Growth Engineering",
    slug: "marketing-growth-engineering",
    description: "Drive explosive customer acquisition, brand awareness, search visibility, and organic growth.",
    icon: "TrendingUp",
    sortOrder: 6,
    subcategories: [
      {
        name: "Digital Marketing & Performance Ads",
        slug: "digital-marketing-paid-ads",
        description: "Google Ads, Meta Ads Manager, TikTok Ads, audience segmentation, and ROI optimization.",
        sortOrder: 1,
      },
      {
        name: "Search Engine Optimization (SEO)",
        slug: "seo-search-engine-optimization",
        description: "Keyword research, technical SEO, on-page optimization, content clusters, and backlink outreach.",
        sortOrder: 2,
      },
      {
        name: "Social Media Marketing & Community",
        slug: "social-media-marketing-community",
        description: "Organic content creation, community engagement, brand viral loops, and influencer partnerships.",
        sortOrder: 3,
      },
      {
        name: "Email Marketing & Automated Funnels",
        slug: "email-marketing-automation",
        description: "Email automation workflows, lead magnets, segmentation, copywriting, and drip campaigns.",
        sortOrder: 4,
      },
      {
        name: "Copywriting & Content Strategy",
        slug: "copywriting-content-strategy",
        description: "High-converting sales copy, landing page storytelling, email sequences, and messaging frameworks.",
        sortOrder: 5,
      },
    ],
  },
  {
    name: "IT, Cloud Architecture & Networks",
    slug: "it-cloud-architecture-networks",
    description: "Architect scalable multi-cloud infrastructure, secure enterprise networks, and server systems.",
    icon: "Cloud",
    sortOrder: 7,
    subcategories: [
      {
        name: "AWS Cloud Solutions",
        slug: "aws-cloud-solutions",
        description: "AWS Solutions Architect concepts, VPC networking, EC2, ECS, Lambda serverless, and IAM security.",
        sortOrder: 1,
      },
      {
        name: "Microsoft Azure Infrastructure",
        slug: "azure-cloud-infrastructure",
        description: "Azure Virtual Machines, Active Directory, Azure Kubernetes Service (AKS), and cloud hybrid setup.",
        sortOrder: 2,
      },
      {
        name: "Google Cloud Platform (GCP)",
        slug: "google-cloud-platform",
        description: "GCP Compute Engine, Google Kubernetes Engine (GKE), BigQuery analytics, and Cloud Run.",
        sortOrder: 3,
      },
      {
        name: "Linux System Administration",
        slug: "linux-system-administration",
        description: "Linux shell scripting, Bash automation, file systems, permissions, and server performance tuning.",
        sortOrder: 4,
      },
      {
        name: "Computer Networking & Protocols",
        slug: "computer-networking-protocols",
        description: "TCP/IP architecture, subnetting, DNS, routing protocols, firewalls, and CCNA concepts.",
        sortOrder: 5,
      },
    ],
  },
  {
    name: "Personal Growth & Peak Performance",
    slug: "personal-growth-performance",
    description: "Unlock mental clarity, public speaking mastery, career acceleration, and peak productivity.",
    icon: "Sparkles",
    sortOrder: 8,
    subcategories: [
      {
        name: "Public Speaking & Storytelling",
        slug: "public-speaking-storytelling",
        description: "Keynote presentation delivery, speech structure, overcoming stage fright, and narrative impact.",
        sortOrder: 1,
      },
      {
        name: "Productivity & Time Mastery",
        slug: "productivity-time-management",
        description: "Deep work habits, time blocking, eliminating procrastination, and personal knowledge systems.",
        sortOrder: 2,
      },
      {
        name: "Career Acceleration & Negotiation",
        slug: "career-acceleration-negotiation",
        description: "Resume optimization, high-stakes compensation negotiation, and executive networking.",
        sortOrder: 3,
      },
      {
        name: "Critical Thinking & Decision Making",
        slug: "critical-thinking-mental-models",
        description: "First-principles thinking, cognitive bias avoidance, probability modeling, and strategic judgment.",
        sortOrder: 4,
      },
    ],
  },
  {
    name: "Health, Fitness & Well-being",
    slug: "health-fitness-wellbeing",
    description: "Optimize physical health, athletic performance, mental resilience, and holistic longevity.",
    icon: "Activity",
    sortOrder: 9,
    subcategories: [
      {
        name: "Nutrition & Dietetics Science",
        slug: "nutrition-dietetics-science",
        description: "Macronutrient balance, evidence-based meal planning, metabolic health, and sports nutrition.",
        sortOrder: 1,
      },
      {
        name: "Strength Training & Bodybuilding",
        slug: "strength-training-bodybuilding",
        description: "Hypertrophy training principles, progressive overload, barbell mechanics, and injury prevention.",
        sortOrder: 2,
      },
      {
        name: "Yoga, Meditation & Breathwork",
        slug: "yoga-meditation-breathwork",
        description: "Vinyasa flows, mindful meditation, pranayama breathing techniques, and somatic awareness.",
        sortOrder: 3,
      },
      {
        name: "Mental Health & Stress Resilience",
        slug: "mental-health-stress-resilience",
        description: "Burnout recovery, emotional regulation, sleep optimization, and autonomic nervous system regulation.",
        sortOrder: 4,
      },
    ],
  },
  {
    name: "Music, Audio & Sound Production",
    slug: "music-audio-production",
    description: "Produce chart-topping tracks, master instruments, engineer acoustic spaces, and perform live.",
    icon: "Music",
    sortOrder: 10,
    subcategories: [
      {
        name: "Music Production & Beat Making",
        slug: "music-production-beatmaking",
        description: "DAW workflows in Ableton Live, FL Studio, Logic Pro, MIDI programming, and synthesis.",
        sortOrder: 1,
      },
      {
        name: "Audio Engineering, Mixing & Mastering",
        slug: "audio-engineering-mixing-mastering",
        description: "EQ techniques, dynamic compression, stereo widening, acoustic treatment, and mastering chains.",
        sortOrder: 2,
      },
      {
        name: "Guitar & String Instruments",
        slug: "guitar-string-instruments",
        description: "Acoustic, electric, and bass guitar, fingerstyle technique, scales, and rhythm accompaniment.",
        sortOrder: 3,
      },
      {
        name: "Piano & Keyboard Mastery",
        slug: "piano-keyboard-mastery",
        description: "Chord progressions, jazz harmony, ear training, sheet music reading, and improvisation.",
        sortOrder: 4,
      },
      {
        name: "Singing & Vocal Performance",
        slug: "singing-vocal-performance",
        description: "Pitch control, breath management, vocal range expansion, resonance, and stage articulation.",
        sortOrder: 5,
      },
    ],
  },
  {
    name: "Languages & Global Communication",
    slug: "languages-global-communication",
    description: "Achieve fluency in global languages and conquer cultural nuances for international careers.",
    icon: "Languages",
    sortOrder: 11,
    subcategories: [
      {
        name: "English for Global Careers",
        slug: "english-global-careers",
        description: "Professional business English, executive vocabulary, clear accent pronunciation, and email etiquette.",
        sortOrder: 1,
      },
      {
        name: "Spanish Language Fluency",
        slug: "spanish-language-fluency",
        description: "Grammar, conversational immersion, subjunctive moods, and DELE exam preparation.",
        sortOrder: 2,
      },
      {
        name: "Mandarin Chinese",
        slug: "mandarin-chinese",
        description: "Pinyin tones, essential Hanzi characters, conversational patterns, and HSK test preparation.",
        sortOrder: 3,
      },
      {
        name: "French Language & Culture",
        slug: "french-language-culture",
        description: "French pronunciation, verb conjugations, everyday spoken dialogue, and cultural etiquette.",
        sortOrder: 4,
      },
      {
        name: "German for Professionals",
        slug: "german-for-professionals",
        description: "Technical German, case structures, sentence mechanics, and Goethe-Institut certification.",
        sortOrder: 5,
      },
      {
        name: "Japanese Language & Culture",
        slug: "japanese-language-culture",
        description: "Hiragana, Katakana, essential Kanji, polite speech (Keigo), and JLPT study.",
        sortOrder: 6,
      },
    ],
  },
  {
    name: "Academics & Core Sciences",
    slug: "academics-core-sciences",
    description: "Explore foundational principles of higher mathematics, physics, chemical sciences, and economics.",
    icon: "GraduationCap",
    sortOrder: 12,
    subcategories: [
      {
        name: "Advanced Mathematics & Calculus",
        slug: "advanced-mathematics-calculus",
        description: "Multivariable calculus, linear algebra, differential equations, and complex analysis.",
        sortOrder: 1,
      },
      {
        name: "Probability & Applied Statistics",
        slug: "probability-applied-statistics",
        description: "Bayesian inference, probability distributions, hypothesis testing, and regression models.",
        sortOrder: 2,
      },
      {
        name: "Physics & Applied Mechanics",
        slug: "physics-applied-mechanics",
        description: "Classical Newtonian mechanics, electromagnetism, thermodynamics, and quantum fundamentals.",
        sortOrder: 3,
      },
      {
        name: "Chemistry & Molecular Sciences",
        slug: "chemistry-molecular-sciences",
        description: "Organic reaction mechanisms, stoichiometry, chemical bonding, and molecular biology.",
        sortOrder: 4,
      },
    ],
  },
  {
    name: "Photography, Video & Media Arts",
    slug: "photography-video-media",
    description: "Master visual storytelling through digital cameras, cinematic lighting, and precision post-production.",
    icon: "Camera",
    sortOrder: 13,
    subcategories: [
      {
        name: "Digital Photography & Lighting",
        slug: "digital-photography-lighting",
        description: "Camera exposure triangle, natural & studio strobe lighting, portraiture, and lens selection.",
        sortOrder: 1,
      },
      {
        name: "Cinematography & Video Shooting",
        slug: "cinematography-filmmaking",
        description: "Composition, cinematic movement, 3-point lighting setups, sound capture, and director craft.",
        sortOrder: 2,
      },
      {
        name: "Video Editing & Post-Production",
        slug: "video-editing-post-production",
        description: "Timeline pacing, DaVinci Resolve, Adobe Premiere Pro, multi-camera sync, and audio cleanup.",
        sortOrder: 3,
      },
      {
        name: "Color Grading & Film Emulation",
        slug: "color-grading-film-emulation",
        description: "Color spaces, node grading in DaVinci Resolve, skin tone balancing, and film print look creation.",
        sortOrder: 4,
      },
    ],
  },
  {
    name: "Lifestyle, Crafts & Culinary Arts",
    slug: "lifestyle-crafts-culinary",
    description: "Indulge in artisanal culinary techniques, home architecture, specialty coffee, and creative hobbies.",
    icon: "Utensils",
    sortOrder: 14,
    subcategories: [
      {
        name: "Culinary Arts & Gourmet Cooking",
        slug: "culinary-arts-gourmet-cooking",
        description: "French culinary foundations, knife skills, pan sauces, pastry baking, and flavor profiling.",
        sortOrder: 1,
      },
      {
        name: "Specialty Coffee & Barista Skills",
        slug: "specialty-coffee-barista",
        description: "Espresso extraction, grind science, milk steaming, latte art, and pour-over methods.",
        sortOrder: 2,
      },
      {
        name: "Interior Design & Space Planning",
        slug: "interior-design-space-planning",
        description: "Color palettes, lighting design, space layout, furniture sourcing, and architectural drafting.",
        sortOrder: 3,
      },
    ],
  },
];

/**
 * Seeds all standard root categories and their child subcategories.
 */
export async function seedStandardCategories(prisma: PrismaClient = defaultPrisma) {
  console.log("🌱 Seeding standard multi-discipline categories and subcategories...");

  let totalParents = 0;
  let totalSubs = 0;

  for (const parentData of STANDARD_CATEGORIES) {
    const parent = await prisma.category.upsert({
      where: { slug: parentData.slug },
      update: {
        name: parentData.name,
        description: parentData.description,
        icon: parentData.icon,
        sortOrder: parentData.sortOrder,
        parentId: null,
        isActive: true,
        isDeleted: false,
        deletedAt: null,
      },
      create: {
        name: parentData.name,
        slug: parentData.slug,
        description: parentData.description,
        icon: parentData.icon,
        sortOrder: parentData.sortOrder,
        parentId: null,
        isActive: true,
        isDeleted: false,
      },
    });
    totalParents++;

    for (const subData of parentData.subcategories) {
      await prisma.category.upsert({
        where: { slug: subData.slug },
        update: {
          name: subData.name,
          description: subData.description,
          icon: subData.icon || parentData.icon,
          sortOrder: subData.sortOrder,
          parentId: parent.id,
          isActive: true,
          isDeleted: false,
          deletedAt: null,
        },
        create: {
          name: subData.name,
          slug: subData.slug,
          description: subData.description,
          icon: subData.icon || parentData.icon,
          sortOrder: subData.sortOrder,
          parentId: parent.id,
          isActive: true,
          isDeleted: false,
        },
      });
      totalSubs++;
    }
  }

  console.log(
    `✅ Successfully seeded ${totalParents} root categories and ${totalSubs} subcategories across all disciplines!`
  );
}

/**
 * Auto-seeds categories on startup if table is empty.
 */
export async function seedCategoriesIfEmpty(prisma: PrismaClient = defaultPrisma) {
  try {
    const existingCount = await prisma.category.count();

    if (existingCount > 0) {
      console.log(
        `📦 Categories already present in database (${existingCount} found). Skipping auto-seeding.`
      );
      return false;
    }

    console.log("⚡ No categories found in database. Initializing standard categories auto-seed...");
    await seedStandardCategories(prisma);
    return true;
  } catch (error) {
    console.error("❌ Failed to auto-seed standard categories on startup:", error);
    throw error;
  }
}
