import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  seedPlansIfEmpty,
  seedStandardPlans,
  STANDARD_FEATURES,
  STANDARD_PLANS,
} from "../src/modules/plan/infrastructure/seed/default-plans.seed";

describe("Subscription Plans & Dynamic Features Seeding", () => {
  let mockPrisma: any;
  let featuresDb: Map<string, any>;
  let plansDb: Map<string, any>;
  let planFeaturesDb: Map<string, any>;

  beforeEach(() => {
    featuresDb = new Map();
    plansDb = new Map();
    planFeaturesDb = new Map();

    mockPrisma = {
      plan: {
        count: async () => plansDb.size,
        upsert: async ({ where, update, create }: any) => {
          const existing = plansDb.get(where.slug);
          if (existing) {
            const updated = { ...existing, ...update };
            plansDb.set(where.slug, updated);
            return updated;
          }
          const created = { id: `plan_${where.slug}`, ...create };
          plansDb.set(where.slug, created);
          return created;
        },
      },
      feature: {
        upsert: async ({ where, update, create }: any) => {
          const existing = featuresDb.get(where.code);
          if (existing) {
            const updated = { ...existing, ...update };
            featuresDb.set(where.code, updated);
            return updated;
          }
          const created = { id: `feat_${where.code}`, ...create };
          featuresDb.set(where.code, created);
          return created;
        },
      },
      planFeature: {
        upsert: async ({ where, update, create }: any) => {
          const key = `${where.planId_featureId.planId}_${where.planId_featureId.featureId}`;
          const existing = planFeaturesDb.get(key);
          if (existing) {
            const updated = { ...existing, ...update };
            planFeaturesDb.set(key, updated);
            return updated;
          }
          const created = { id: `pf_${key}`, ...create };
          planFeaturesDb.set(key, created);
          return created;
        },
      },
    };
  });

  it("should seed standard features and standard plans when db is empty", async () => {
    assert.equal(await mockPrisma.plan.count(), 0);

    const seeded = await seedPlansIfEmpty(mockPrisma);
    assert.equal(seeded, true);

    // Verify all standard features were created
    assert.equal(featuresDb.size, STANDARD_FEATURES.length);
    for (const feat of STANDARD_FEATURES) {
      assert.ok(featuresDb.has(feat.code));
      assert.equal(featuresDb.get(feat.code).name, feat.name);
    }

    // Verify all standard plans were created
    assert.equal(plansDb.size, STANDARD_PLANS.length);
    assert.ok(plansDb.has("starter"));
    assert.ok(plansDb.has("pro-educator"));
    assert.ok(plansDb.has("elite-academy"));

    // Verify plan features were linked
    assert.ok(planFeaturesDb.size > 0);
  });

  it("should skip seeding if plans already exist in database", async () => {
    // Simulate pre-existing plan
    plansDb.set("custom-plan", { id: "p1", slug: "custom-plan", name: "Custom Plan" });
    assert.equal(await mockPrisma.plan.count(), 1);

    const seeded = await seedPlansIfEmpty(mockPrisma);
    assert.equal(seeded, false);

    // Verify no new standard plans were force-added
    assert.equal(plansDb.size, 1);
    assert.ok(!plansDb.has("starter"));
  });

  it("should support direct manual seeding via seedStandardPlans", async () => {
    await seedStandardPlans(mockPrisma);

    assert.equal(featuresDb.size, STANDARD_FEATURES.length);
    assert.equal(plansDb.size, STANDARD_PLANS.length);
    assert.ok(plansDb.has("starter"));
    assert.ok(plansDb.has("pro-educator"));
    assert.ok(plansDb.has("elite-academy"));
  });
});
