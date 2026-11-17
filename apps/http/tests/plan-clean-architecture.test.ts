import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  Plan,
  Feature,
  IPlanRepository,
  CreatePlanDto,
  UpdatePlanDto,
  PlanSlugPolicy,
  PlanValidationPolicy,
  GetPlansUseCase,
  GetPlanByIdUseCase,
  AdminCreatePlanUseCase,
  AdminUpdatePlanUseCase,
  AdminDeletePlanUseCase,
  AdminGetAllPlansUseCase,
  AdminGetAllFeaturesUseCase,
  AdminManagePlansUseCase,
  createPlanModule,
  createPlanSchema,
  updatePlanSchema,
  PlanNotFoundError,
  PlanConflictError,
  PlanValidationError,
} from "../src/modules/plan";

// ============================================================================
// IN-MEMORY PLAN REPOSITORY MOCK
// ============================================================================

class InMemoryPlanRepository implements IPlanRepository {
  public plans: Map<string, Plan> = new Map();
  public features: Map<string, Feature> = new Map();

  async findAll(includeInactive = false): Promise<Plan[]> {
    return Array.from(this.plans.values())
      .filter((p) => includeInactive || p.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((p) => ({ ...p }));
  }

  async findById(id: string): Promise<Plan | null> {
    const plan = this.plans.get(id);
    return plan ? { ...plan } : null;
  }

  async findBySlug(slug: string): Promise<Plan | null> {
    const normalized = slug.trim().toLowerCase();
    for (const plan of this.plans.values()) {
      if (plan.slug.toLowerCase() === normalized) {
        return { ...plan };
      }
    }
    return null;
  }

  async create(data: CreatePlanDto): Promise<Plan> {
    const id = `plan_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const now = new Date();

    const entity: Plan = {
      id,
      name: data.name,
      slug: data.slug,
      tagline: data.tagline || null,
      description: data.description || null,
      price: data.price,
      currency: data.currency || "INR",
      billingCycle: data.billingCycle || "MONTHLY",
      trialDays: data.trialDays || 0,
      isActive: data.isActive !== undefined ? data.isActive : true,
      isFeatured: data.isFeatured || false,
      sortOrder: data.sortOrder || 0,
      features: data.features?.map((f) => ({
        id: `pf_${f.featureId}`,
        planId: id,
        featureId: f.featureId,
        value: f.value,
        isUnlimited: f.isUnlimited || false,
        createdAt: now,
        updatedAt: now,
      })),
      createdAt: now,
      updatedAt: now,
    };

    this.plans.set(id, entity);
    return { ...entity };
  }

  async update(id: string, data: UpdatePlanDto): Promise<Plan> {
    const existing = this.plans.get(id);
    if (!existing) {
      throw new PlanNotFoundError(`Plan with id '${id}' not found.`);
    }

    const updated: Plan = {
      ...existing,
      name: data.name !== undefined ? data.name : existing.name,
      slug: data.slug !== undefined ? data.slug : existing.slug,
      tagline: data.tagline !== undefined ? data.tagline : existing.tagline,
      description: data.description !== undefined ? data.description : existing.description,
      price: data.price !== undefined ? data.price : existing.price,
      currency: data.currency !== undefined ? data.currency : existing.currency,
      billingCycle: data.billingCycle !== undefined ? data.billingCycle : existing.billingCycle,
      trialDays: data.trialDays !== undefined ? data.trialDays : existing.trialDays,
      isActive: data.isActive !== undefined ? data.isActive : existing.isActive,
      isFeatured: data.isFeatured !== undefined ? data.isFeatured : existing.isFeatured,
      sortOrder: data.sortOrder !== undefined ? data.sortOrder : existing.sortOrder,
      updatedAt: new Date(),
    };

    this.plans.set(id, updated);
    return { ...updated };
  }

  async delete(id: string): Promise<boolean> {
    return this.plans.delete(id);
  }

  async findAllFeatures(): Promise<Feature[]> {
    return Array.from(this.features.values()).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async findFeatureByCode(code: string): Promise<Feature | null> {
    for (const feat of this.features.values()) {
      if (feat.code === code) return { ...feat };
    }
    return null;
  }
}

// ============================================================================
// TEST SUITES
// ============================================================================

describe("Plan Module Clean Architecture & SOLID Principles Suite", () => {
  let repo: InMemoryPlanRepository;

  beforeEach(() => {
    repo = new InMemoryPlanRepository();

    // Seed mock features
    repo.features.set("feat_storage", {
      id: "feat_storage",
      code: "STORAGE_GB",
      name: "Storage Limit",
      description: "Cloud storage quota in GB",
      featureType: "NUMERIC",
      category: "STORAGE",
      unit: "GB",
      sortOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    repo.features.set("feat_live", {
      id: "feat_live",
      code: "LIVE_STREAMING",
      name: "Live Cohort Streaming",
      description: "Live streaming capability",
      featureType: "BOOLEAN",
      category: "LIVE_STREAMING",
      unit: null,
      sortOrder: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Seed active and inactive plans
    repo.plans.set("plan_starter", {
      id: "plan_starter",
      name: "Starter Tier",
      slug: "starter-tier",
      tagline: "Great for new educators",
      description: "Basic features",
      price: 999,
      currency: "INR",
      billingCycle: "MONTHLY",
      trialDays: 7,
      isActive: true,
      isFeatured: false,
      sortOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    repo.plans.set("plan_enterprise", {
      id: "plan_enterprise",
      name: "Enterprise Tier",
      slug: "enterprise-tier",
      tagline: "Full institution power",
      description: "All features unlocked",
      price: 29999,
      currency: "INR",
      billingCycle: "YEARLY",
      trialDays: 14,
      isActive: false, // Inactive
      isFeatured: true,
      sortOrder: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  // --------------------------------------------------------------------------
  // SUITE 1: Domain Policies
  // --------------------------------------------------------------------------
  describe("1. Domain Policies", () => {
    describe("PlanSlugPolicy", () => {
      it("generates sanitized URL-friendly slugs from names", () => {
        assert.equal(PlanSlugPolicy.generateSlug("Pro Educator Plan"), "pro-educator-plan");
        assert.equal(PlanSlugPolicy.generateSlug("  Enterprise! Tier 2026-- "), "enterprise-tier-2026");
      });

      it("validates slug adheres to lowercase alphanumeric and hyphen regex", () => {
        assert.doesNotThrow(() => PlanSlugPolicy.validateSlug("starter-plan-2026"));

        assert.throws(
          () => PlanSlugPolicy.validateSlug("Starter_Plan"),
          (err: any) => err instanceof PlanValidationError && err.message.includes("lowercase alphanumeric")
        );

        assert.throws(
          () => PlanSlugPolicy.validateSlug("a"),
          (err: any) => err instanceof PlanValidationError && err.message.includes("at least 2")
        );
      });
    });

    describe("PlanValidationPolicy", () => {
      it("validates creation requires name [2, 100] and valid slug", () => {
        assert.throws(
          () => {
            PlanValidationPolicy.validateCreation({
              name: "A",
              slug: "valid-slug",
              price: 100,
            });
          },
          (err: any) => err instanceof PlanValidationError && err.message.includes("at least 2")
        );

        assert.throws(
          () => {
            PlanValidationPolicy.validateCreation({
              name: "Valid Plan",
              slug: "",
              price: 100,
            });
          },
          (err: any) => err instanceof PlanValidationError && err.message.includes("slug is required")
        );
      });

      it("rejects negative price and negative trial days", () => {
        assert.throws(
          () => {
            PlanValidationPolicy.validateCreation({
              name: "Valid Plan",
              slug: "valid-slug",
              price: -50,
            });
          },
          (err: any) => err instanceof PlanValidationError && err.message.includes("Price cannot be negative")
        );

        assert.throws(
          () => {
            PlanValidationPolicy.validateCreation({
              name: "Valid Plan",
              slug: "valid-slug",
              price: 100,
              trialDays: -3,
            });
          },
          (err: any) => err instanceof PlanValidationError && err.message.includes("Trial days cannot be negative")
        );
      });

      it("validates billing cycle against allowed values", () => {
        assert.throws(
          () => {
            PlanValidationPolicy.validateCreation({
              name: "Valid Plan",
              slug: "valid-slug",
              price: 100,
              billingCycle: "BIWEEKLY" as any,
            });
          },
          (err: any) => err instanceof PlanValidationError && err.message.includes("Invalid billing cycle")
        );
      });
    });
  });

  // --------------------------------------------------------------------------
  // SUITE 2: Plan Catalog & Dynamic Feature Queries
  // --------------------------------------------------------------------------
  describe("2. Plan Catalog & Dynamic Feature Queries", () => {
    it("GetPlansUseCase returns active plans and dynamic features by default", async () => {
      const useCase = new GetPlansUseCase(repo);
      const result = await useCase.execute();

      assert.equal(result.plans.length, 1);
      assert.equal(result.plans[0].id, "plan_starter");
      assert.equal(result.features.length, 2);
    });

    it("GetPlansUseCase includes inactive plans when requested", async () => {
      const useCase = new GetPlansUseCase(repo);
      const result = await useCase.execute(true);

      assert.equal(result.plans.length, 2);
      assert.ok(result.plans.some((p) => p.id === "plan_enterprise"));
    });

    it("GetPlanByIdUseCase returns single plan", async () => {
      const useCase = new GetPlanByIdUseCase(repo);
      const plan = await useCase.execute("plan_starter");

      assert.equal(plan.id, "plan_starter");
      assert.equal(plan.name, "Starter Tier");
    });

    it("GetPlanByIdUseCase throws PlanNotFoundError when plan does not exist", async () => {
      const useCase = new GetPlanByIdUseCase(repo);
      await assert.rejects(
        async () => {
          await useCase.execute("non_existent_plan");
        },
        (err: any) => err instanceof PlanNotFoundError && err.message.includes("not found")
      );
    });

    it("AdminGetAllFeaturesUseCase returns all features", async () => {
      const useCase = new AdminGetAllFeaturesUseCase(repo);
      const features = await useCase.execute();

      assert.equal(features.length, 2);
      assert.equal(features[0].code, "STORAGE_GB");
    });
  });

  // --------------------------------------------------------------------------
  // SUITE 3: Admin Plan Lifecycle & Fine-Grained Use Cases
  // --------------------------------------------------------------------------
  describe("3. Admin Plan Lifecycle", () => {
    it("AdminCreatePlanUseCase creates new plan with normalized slug", async () => {
      const useCase = new AdminCreatePlanUseCase(repo);
      const created = await useCase.execute({
        name: "Pro Educator Tier",
        slug: "pro-educator-tier",
        price: 2999,
        billingCycle: "MONTHLY",
        trialDays: 14,
      });

      assert.ok(created.id);
      assert.equal(created.name, "Pro Educator Tier");
      assert.equal(created.slug, "pro-educator-tier");
      assert.equal(created.price, 2999);
    });

    it("AdminCreatePlanUseCase throws PlanConflictError on duplicate slug", async () => {
      const useCase = new AdminCreatePlanUseCase(repo);
      await assert.rejects(
        async () => {
          await useCase.execute({
            name: "Duplicate Starter",
            slug: "starter-tier", // already exists
            price: 500,
          });
        },
        (err: any) => err instanceof PlanConflictError && err.message.includes("already exists")
      );
    });

    it("AdminUpdatePlanUseCase updates plan fields and permits keeping current slug", async () => {
      const useCase = new AdminUpdatePlanUseCase(repo);
      const updated = await useCase.execute("plan_starter", {
        name: "Starter Tier Updated",
        price: 1299,
        slug: "starter-tier", // keeping same slug
      });

      assert.equal(updated.name, "Starter Tier Updated");
      assert.equal(updated.price, 1299);
    });

    it("AdminUpdatePlanUseCase throws PlanConflictError when changing to another plan's slug", async () => {
      const useCase = new AdminUpdatePlanUseCase(repo);
      await assert.rejects(
        async () => {
          await useCase.execute("plan_starter", {
            slug: "enterprise-tier", // belongs to plan_enterprise
          });
        },
        (err: any) => err instanceof PlanConflictError && err.message.includes("already exists")
      );
    });

    it("AdminUpdatePlanUseCase throws PlanNotFoundError when plan does not exist", async () => {
      const useCase = new AdminUpdatePlanUseCase(repo);
      await assert.rejects(
        async () => {
          await useCase.execute("non_existent_plan", { name: "New Name" });
        },
        (err: any) => err instanceof PlanNotFoundError
      );
    });

    it("AdminDeletePlanUseCase deletes plan and throws PlanNotFoundError if missing", async () => {
      const deleteUseCase = new AdminDeletePlanUseCase(repo);
      const deleted = await deleteUseCase.execute("plan_starter");
      assert.equal(deleted, true);

      const found = await repo.findById("plan_starter");
      assert.equal(found, null);

      await assert.rejects(
        async () => {
          await deleteUseCase.execute("plan_starter");
        },
        (err: any) => err instanceof PlanNotFoundError
      );
    });
  });

  // --------------------------------------------------------------------------
  // SUITE 4: Backward-Compatible Facade (AdminManagePlansUseCase)
  // --------------------------------------------------------------------------
  describe("4. Backward-Compatible Facade", () => {
    it("AdminManagePlansUseCase delegates all methods cleanly", async () => {
      const facade = new AdminManagePlansUseCase(repo);

      const allPlans = await facade.getAllPlans();
      assert.equal(allPlans.length, 2);

      const allFeatures = await facade.getAllFeatures();
      assert.equal(allFeatures.length, 2);

      const starter = await facade.getPlanById("plan_starter");
      assert.equal(starter?.id, "plan_starter");

      const created = await facade.createPlan({
        name: "Facade Plan",
        slug: "facade-plan",
        price: 499,
      });
      assert.equal(created.slug, "facade-plan");

      const updated = await facade.updatePlan(created.id, { price: 599 });
      assert.equal(updated.price, 599);

      const deleted = await facade.deletePlan(created.id);
      assert.equal(deleted, true);
    });
  });

  // --------------------------------------------------------------------------
  // SUITE 5: Presentation Schemas & Input Validation
  // --------------------------------------------------------------------------
  describe("5. Presentation Schemas & Input Validation", () => {
    it("validates createPlanSchema accepts valid payload and coerces numbers", () => {
      const parsed = createPlanSchema.parse({
        name: "Pro Tier",
        slug: "pro-tier",
        price: "1999", // string coerced to number
        trialDays: "7",
        sortOrder: "1",
      });

      assert.equal(parsed.name, "Pro Tier");
      assert.equal(parsed.slug, "pro-tier");
      assert.equal(parsed.price, 1999);
      assert.equal(parsed.trialDays, 7);
      assert.equal(parsed.sortOrder, 1);
    });

    it("rejects createPlanSchema with invalid slug regex", () => {
      assert.throws(() => {
        createPlanSchema.parse({
          name: "Invalid Slug Tier",
          slug: "Invalid_Slug!",
          price: 100,
        });
      });
    });

    it("validates updatePlanSchema allows partial updates", () => {
      const parsed = updatePlanSchema.parse({
        price: 2500,
      });
      assert.equal(parsed.price, 2500);
    });
  });

  // --------------------------------------------------------------------------
  // SUITE 6: Dependency Inversion Module Factory
  // --------------------------------------------------------------------------
  describe("6. Dependency Inversion Module Factory", () => {
    it("createPlanModule instantiates cleanly with injected repository", () => {
      const customRepo = new InMemoryPlanRepository();
      const moduleInstance = createPlanModule({ planRepo: customRepo });

      assert.ok(moduleInstance.planRouter);
      assert.ok(moduleInstance.planRepo);
      assert.ok(moduleInstance.planController);
      assert.ok(moduleInstance.useCases.getPlansUseCase);
      assert.ok(moduleInstance.useCases.getPlanByIdUseCase);
      assert.ok(moduleInstance.useCases.adminCreatePlanUseCase);
      assert.ok(moduleInstance.useCases.adminUpdatePlanUseCase);
      assert.ok(moduleInstance.useCases.adminDeletePlanUseCase);
    });
  });
});
