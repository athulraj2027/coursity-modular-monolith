---
name: prisma-database-workflow
description: >-
  Use this skill when modifying database models, managing multi-file Prisma schemas, running migrations,
  writing database seed scripts, or optimizing queries in apps/http/prisma.
---

# Prisma Database & Migration Workflow Skill (`apps/http/prisma`)

This skill defines rules and procedures for managing PostgreSQL database schemas and migrations in **Coursity** using **Prisma ORM 6** with multi-file schema support.

---

## 📂 Multi-File Schema Architecture

The database schema is organized into modular files located in [`apps/http/prisma/schema/`](file:///d:/second-project/coursity-rebuild/apps/http/prisma/schema):

```
apps/http/prisma/
├── schema/
│   ├── base.prisma              # Datasource (PostgreSQL) & client generator configs
│   ├── user.prisma              # User accounts, TeacherProfile, Profile, RefreshTokens
│   ├── wallet.prisma            # Wallets, WalletTransactions & PayoutRequests
│   ├── bank-detail.prisma       # Instructor & Student BankDetails & UPI IDs
│   ├── course.prisma            # Courses, Modules, Lessons, Attachments, Enrollments
│   ├── category.prisma          # Course categories, subcategories, metadata
│   ├── plan.prisma              # Plan, Feature, PlanFeature, Subscription, UsageRecord
│   ├── offer.prisma             # Platform promotional offers, coupons & redemptions
│   ├── wishlist.prisma          # Student saved course wishlists
│   ├── interview.prisma         # Teacher & student AI interview sessions, Turns, Reports
│   ├── ai-config.prisma         # AI providers, model configurations, API keys
│   └── idempotency.prisma       # API idempotency keys & cached payloads
│
├── seed-plans.ts                # Plan & feature catalog seeding script
├── seed-categories.ts           # Educational taxonomy seeding script
└── seed-ai-providers.ts         # LLM/STT/TTS provider configuration seeds

```

---

## 🚀 Migration & Schema Change Workflow

Follow this procedure whenever making database changes:

### Step 1: Edit the Domain-Specific `.prisma` File
Identify which file in `prisma/schema/` owns the model. Add or modify fields, enums, relations, and indexes.

> [!IMPORTANT]
> Always define appropriate `@index` or `@@index` annotations for columns frequently queried in `WHERE` clauses (e.g., `userId`, `status`, `createdAt`).

### Step 2: Generate Type-Safe Prisma Client
```bash
# In apps/http
npm run prisma:generate
```

### Step 3: Create & Apply Database Migration
```bash
# In apps/http
npm run prisma:migrate
```
* Provide a descriptive migration name when prompted (e.g., `add_subscription_grace_period`).

### Step 4: Run Seeding (If Applicable)
```bash
# In apps/http
npx tsx prisma/seed-plans.ts
npx tsx prisma/seed-categories.ts
npx tsx prisma/seed-ai-providers.ts
```

---

## 🔒 Transaction Management & Concurrency Best Practices

### 1. Atomic Multi-Record Mutations
Always use interactive transactions for operations that must succeed or fail together:

```typescript
import { PrismaClient } from "@prisma/client";

export async function processSubscriptionUpgrade(
  prisma: PrismaClient,
  teacherId: string,
  newPlanId: string
) {
  return prisma.$transaction(async (tx) => {
    // 1. Mark existing active subscription as upgraded/cancelled
    await tx.subscription.updateMany({
      where: { teacherId, status: "ACTIVE" },
      data: { status: "UPGRADED" },
    });

    // 2. Create new subscription record
    const subscription = await tx.subscription.create({
      data: {
        teacherId,
        planId: newPlanId,
        status: "ACTIVE",
        startDate: new Date(),
      },
    });

    // 3. Reset usage quotas for the new billing cycle
    await tx.usageRecord.create({
      data: {
        subscriptionId: subscription.id,
        liveMinutesUsed: 0,
        storageBytesUsed: 0,
      },
    });

    return subscription;
  });
}
```

### 2. Idempotency Key Handling
Check the `idempotency` table before executing side-effect heavy operations (such as payment captures and invoice generation).
