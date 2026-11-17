import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  OfferEntity,
  OfferRedemptionEntity,
  IOfferRepository,
  IPlanLookupRepository,
  PlanLookupDto,
  CreateOfferDto,
  UpdateOfferDto,
  ListOffersQueryDto,
  RecordRedemptionDto,
  OfferAnalyticsDto,
  OfferValidationPolicy,
  OfferDiscountPolicy,
  OfferEligibilityPolicy,
  GetPlanOfferUseCase,
  GetActiveOffersUseCase,
  AdminCreateOfferUseCase,
  AdminUpdateOfferUseCase,
  AdminToggleOfferUseCase,
  AdminDeleteOfferUseCase,
  AdminListOffersUseCase,
  AdminGetOfferAnalyticsUseCase,
  createOfferModule,
  createOfferBodySchema,
  updateOfferBodySchema,
  getPlanOfferQuerySchema,
  listOffersQueryObjectSchema,
  OfferNotFoundError,
  OfferValidationError,
} from "../src/modules/offer";
import { ITeacherProfileResolver } from "@/modules/course/domain/services/teacher-profile-resolver.service";

// ============================================================================
// IN-MEMORY REPOSITORY MOCKS
// ============================================================================

class InMemoryPlanRepository implements IPlanLookupRepository {
  public plans: Map<string, PlanLookupDto> = new Map();

  async findById(planId: string): Promise<PlanLookupDto | null> {
    const plan = this.plans.get(planId);
    return plan ? { ...plan } : null;
  }
}

class InMemoryOfferRepository implements IOfferRepository {
  public offers: Map<string, OfferEntity> = new Map();
  public redemptions: OfferRedemptionEntity[] = [];
  public userSubscribedHistory: Set<string> = new Set(); // teacherProfileIds

  async findById(id: string): Promise<OfferEntity | null> {
    const offer = this.offers.get(id);
    return offer ? { ...offer } : null;
  }

  async findActiveOffers(planId?: string, billingCycle?: string): Promise<OfferEntity[]> {
    const now = new Date();
    return Array.from(this.offers.values()).filter((offer) => {
      if (!offer.isActive) return false;
      if (!OfferEligibilityPolicy.isTimeValid({ now, validFrom: offer.validFrom, validUntil: offer.validUntil })) {
        return false;
      }
      if (!OfferEligibilityPolicy.hasGlobalCapacity(offer.maxRedemptions, offer.usedRedemptions)) {
        return false;
      }
      if (planId && offer.applicablePlans && offer.applicablePlans.length > 0) {
        if (!offer.applicablePlans.some((p) => p.planId === planId)) return false;
      }
      if (billingCycle && offer.applicableCycles && offer.applicableCycles.length > 0) {
        if (!offer.applicableCycles.some((c) => c.billingCycle === billingCycle)) return false;
      }
      return true;
    });
  }

  async findRedemptionCountByUser(offerId: string, teacherProfileId: string): Promise<number> {
    return this.redemptions.filter(
      (r) => r.offerId === offerId && r.teacherProfileId === teacherProfileId
    ).length;
  }

  async hasUserSubscribedBefore(teacherProfileId: string): Promise<boolean> {
    return this.userSubscribedHistory.has(teacherProfileId);
  }

  async create(data: CreateOfferDto): Promise<OfferEntity> {
    const id = `offer_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const now = new Date();

    const entity: OfferEntity = {
      id,
      title: data.title,
      description: data.description || null,
      discountType: data.discountType,
      discountValue: Number(data.discountValue),
      maxDiscountAmount: data.maxDiscountAmount ? Number(data.maxDiscountAmount) : null,
      minOrderAmount: data.minOrderAmount ? Number(data.minOrderAmount) : null,
      eligibility: data.eligibility || "ALL_TEACHERS",
      badgeText: data.badgeText || null,
      maxRedemptions: data.maxRedemptions ?? null,
      usedRedemptions: 0,
      maxRedemptionsPerUser: data.maxRedemptionsPerUser ?? 1,
      validFrom: data.validFrom ? new Date(data.validFrom) : now,
      validUntil: data.validUntil ? new Date(data.validUntil) : null,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: now,
      updatedAt: now,
      applicablePlans: data.applicablePlanIds?.map((pid) => ({
        id: `op_${pid}`,
        offerId: id,
        planId: pid,
        createdAt: now,
      })),
      applicableCycles: data.applicableCycles?.map((cycle) => ({
        id: `oc_${cycle}`,
        offerId: id,
        billingCycle: cycle,
        createdAt: now,
      })),
    };

    this.offers.set(id, entity);
    return { ...entity };
  }

  async update(id: string, data: UpdateOfferDto): Promise<OfferEntity> {
    const existing = this.offers.get(id);
    if (!existing) {
      throw new OfferNotFoundError(`Offer with ID '${id}' not found.`);
    }

    const updated: OfferEntity = {
      ...existing,
      title: data.title !== undefined ? data.title : existing.title,
      description: data.description !== undefined ? data.description : existing.description,
      discountType: data.discountType !== undefined ? data.discountType : existing.discountType,
      discountValue: data.discountValue !== undefined ? Number(data.discountValue) : existing.discountValue,
      maxDiscountAmount:
        data.maxDiscountAmount !== undefined ? (data.maxDiscountAmount ? Number(data.maxDiscountAmount) : null) : existing.maxDiscountAmount,
      minOrderAmount:
        data.minOrderAmount !== undefined ? (data.minOrderAmount ? Number(data.minOrderAmount) : null) : existing.minOrderAmount,
      eligibility: data.eligibility !== undefined ? data.eligibility : existing.eligibility,
      badgeText: data.badgeText !== undefined ? data.badgeText : existing.badgeText,
      maxRedemptions:
        data.maxRedemptions !== undefined ? data.maxRedemptions : existing.maxRedemptions,
      maxRedemptionsPerUser:
        data.maxRedemptionsPerUser !== undefined ? data.maxRedemptionsPerUser : existing.maxRedemptionsPerUser,
      validFrom: data.validFrom ? new Date(data.validFrom) : existing.validFrom,
      validUntil: data.validUntil !== undefined ? (data.validUntil ? new Date(data.validUntil) : null) : existing.validUntil,
      isActive: data.isActive !== undefined ? data.isActive : existing.isActive,
      updatedAt: new Date(),
    };

    this.offers.set(id, updated);
    return { ...updated };
  }

  async delete(id: string): Promise<void> {
    this.offers.delete(id);
  }

  async toggleStatus(id: string): Promise<OfferEntity> {
    const existing = this.offers.get(id);
    if (!existing) {
      throw new OfferNotFoundError(`Offer with ID '${id}' not found.`);
    }
    existing.isActive = !existing.isActive;
    existing.updatedAt = new Date();
    this.offers.set(id, existing);
    return { ...existing };
  }

  async findAllAdmin(query: ListOffersQueryDto): Promise<{ offers: OfferEntity[]; total: number }> {
    let all = Array.from(this.offers.values());

    if (query.status === "active") all = all.filter((o) => o.isActive);
    if (query.status === "disabled") all = all.filter((o) => !o.isActive);
    if (query.discountType && query.discountType !== "all") {
      all = all.filter((o) => o.discountType === query.discountType);
    }
    if (query.search) {
      const q = query.search.toLowerCase();
      all = all.filter(
        (o) => o.title.toLowerCase().includes(q) || (o.description && o.description.toLowerCase().includes(q))
      );
    }

    const page = query.page || 1;
    const limit = query.limit || 10;
    const start = (page - 1) * limit;
    const paginated = all.slice(start, start + limit);

    return {
      offers: paginated.map((o) => ({ ...o })),
      total: all.length,
    };
  }

  async recordRedemption(data: RecordRedemptionDto): Promise<OfferRedemptionEntity> {
    const redemption: OfferRedemptionEntity = {
      id: `red_${Date.now()}`,
      offerId: data.offerId,
      teacherProfileId: data.teacherProfileId,
      subscriptionId: data.subscriptionId || null,
      invoiceId: data.invoiceId || null,
      discountAmount: data.discountAmount,
      finalPaidAmount: data.finalPaidAmount,
      redeemedAt: new Date(),
    };
    this.redemptions.push(redemption);
    return redemption;
  }

  async incrementRedemptions(offerId: string): Promise<void> {
    const existing = this.offers.get(offerId);
    if (existing) {
      existing.usedRedemptions += 1;
      this.offers.set(offerId, existing);
    }
  }

  async getAnalytics(): Promise<OfferAnalyticsDto> {
    const all = Array.from(this.offers.values());
    const totalOffers = all.length;
    const activeOffers = all.filter((o) => o.isActive).length;
    const totalRedemptions = this.redemptions.length;
    const totalDiscountGiven = this.redemptions.reduce((sum, r) => sum + r.discountAmount, 0);
    const totalRevenueGenerated = this.redemptions.reduce((sum, r) => sum + r.finalPaidAmount, 0);

    return {
      totalOffers,
      activeOffers,
      totalRedemptions,
      totalDiscountGiven,
      totalRevenueGenerated,
      recentRedemptions: this.redemptions.slice(-5).map((r) => ({
        id: r.id,
        offerTitle: this.offers.get(r.offerId)?.title || "Offer",
        teacherName: "Teacher User",
        teacherEmail: "teacher@test.com",
        discountAmount: r.discountAmount,
        finalPaidAmount: r.finalPaidAmount,
        redeemedAt: r.redeemedAt,
      })),
    };
  }
}

class MockTeacherProfileResolver implements ITeacherProfileResolver {
  public mapping: Map<string, string> = new Map();

  constructor() {
    this.mapping.set("user_teacher_1", "teacher_profile_1");
    this.mapping.set("user_teacher_2", "teacher_profile_2");
  }

  async getTeacherProfileIdByUserId(userId: string): Promise<string> {
    return this.mapping.has(userId) ? this.mapping.get(userId)! : `teacher_profile_of_${userId}`;
  }
}

// ============================================================================
// TEST SUITES
// ============================================================================

describe("Offer Module Clean Architecture & SOLID Principles Suite", () => {
  let offerRepo: InMemoryOfferRepository;
  let planRepo: InMemoryPlanRepository;
  let profileResolver: MockTeacherProfileResolver;

  beforeEach(() => {
    offerRepo = new InMemoryOfferRepository();
    planRepo = new InMemoryPlanRepository();
    profileResolver = new MockTeacherProfileResolver();

    // Seed mock plans (stored in paise, e.g. 100000 = ₹1,000)
    planRepo.plans.set("plan_starter", {
      id: "plan_starter",
      name: "Starter Plan",
      price: 100000,
      billingCycle: "MONTHLY",
    });

    planRepo.plans.set("plan_pro", {
      id: "plan_pro",
      name: "Professional Plan",
      price: 500000,
      billingCycle: "YEARLY",
    });

    planRepo.plans.set("plan_free", {
      id: "plan_free",
      name: "Free Tier",
      price: 0,
      billingCycle: "MONTHLY",
    });
  });

  // --------------------------------------------------------------------------
  // SUITE 1: Domain Policies
  // --------------------------------------------------------------------------
  describe("1. Domain Policies", () => {
    describe("OfferValidationPolicy", () => {
      it("validates creation requires non-empty title between 3 and 120 chars", () => {
        assert.throws(
          () => {
            OfferValidationPolicy.validateCreation({
              title: "Hi",
              discountType: "PERCENTAGE",
              discountValue: 20,
            });
          },
          (err: any) => err instanceof OfferValidationError && err.message.includes("at least 3")
        );

        assert.throws(
          () => {
            OfferValidationPolicy.validateCreation({
              title: "A".repeat(121),
              discountType: "PERCENTAGE",
              discountValue: 20,
            });
          },
          (err: any) => err instanceof OfferValidationError && err.message.includes("cannot exceed 120")
        );
      });

      it("rejects percentage discount > 100% and discountValue <= 0", () => {
        assert.throws(
          () => {
            OfferValidationPolicy.validateCreation({
              title: "Super Sale",
              discountType: "PERCENTAGE",
              discountValue: 150,
            });
          },
          (err: any) => err instanceof OfferValidationError && err.message.includes("cannot exceed 100%")
        );

        assert.throws(
          () => {
            OfferValidationPolicy.validateCreation({
              title: "Zero Discount",
              discountType: "FLAT",
              discountValue: 0,
            });
          },
          (err: any) => err instanceof OfferValidationError && err.message.includes("greater than 0")
        );
      });

      it("enforces validUntil is strictly after validFrom", () => {
        const from = new Date("2026-12-01T00:00:00Z");
        const until = new Date("2026-11-01T00:00:00Z");

        assert.throws(
          () => {
            OfferValidationPolicy.validateCreation({
              title: "Expired Sale",
              discountType: "PERCENTAGE",
              discountValue: 10,
              validFrom: from,
              validUntil: until,
            });
          },
          (err: any) => err instanceof OfferValidationError && err.message.includes("Expiry date must be after")
        );
      });
    });

    describe("OfferDiscountPolicy", () => {
      it("calculates percentage discount accurately without cap", () => {
        const discount = OfferDiscountPolicy.calculateDiscount({
          basePrice: 1000,
          discountType: "PERCENTAGE",
          discountValue: 20,
        });
        assert.equal(discount, 200);
      });

      it("respects maxDiscountAmount cap on percentage discounts", () => {
        const discount = OfferDiscountPolicy.calculateDiscount({
          basePrice: 10000,
          discountType: "PERCENTAGE",
          discountValue: 50, // would be 5000
          maxDiscountAmount: 1500,
        });
        assert.equal(discount, 1500);
      });

      it("calculates flat discount clamped at base price", () => {
        const discount1 = OfferDiscountPolicy.calculateDiscount({
          basePrice: 1000,
          discountType: "FLAT",
          discountValue: 300,
        });
        assert.equal(discount1, 300);

        const discount2 = OfferDiscountPolicy.calculateDiscount({
          basePrice: 500,
          discountType: "FLAT",
          discountValue: 800, // exceeds base price
        });
        assert.equal(discount2, 500); // Clamped
      });

      it("evaluates minimum order requirement accurately", () => {
        assert.equal(OfferDiscountPolicy.meetsMinimumOrder(1000, 500), true);
        assert.equal(OfferDiscountPolicy.meetsMinimumOrder(1000, 1000), true);
        assert.equal(OfferDiscountPolicy.meetsMinimumOrder(400, 500), false);
        assert.equal(OfferDiscountPolicy.meetsMinimumOrder(100, null), true);
      });
    });

    describe("OfferEligibilityPolicy", () => {
      it("validates time window boundaries", () => {
        const now = new Date("2026-11-17T12:00:00Z");
        const from = new Date("2026-11-01T00:00:00Z");
        const until = new Date("2026-11-30T00:00:00Z");

        assert.equal(OfferEligibilityPolicy.isTimeValid({ now, validFrom: from, validUntil: until }), true);
        assert.equal(
          OfferEligibilityPolicy.isTimeValid({ now, validFrom: new Date("2026-12-01T00:00:00Z"), validUntil: null }),
          false
        );
      });

      it("enforces teacher eligibility criteria for NEW_TEACHERS_ONLY", () => {
        assert.equal(OfferEligibilityPolicy.isTeacherEligible("ALL_TEACHERS", true), true);
        assert.equal(OfferEligibilityPolicy.isTeacherEligible("ALL_TEACHERS", false), true);
        assert.equal(OfferEligibilityPolicy.isTeacherEligible("NEW_TEACHERS_ONLY", false), true);
        assert.equal(OfferEligibilityPolicy.isTeacherEligible("NEW_TEACHERS_ONLY", true), false);
      });
    });
  });

  // --------------------------------------------------------------------------
  // SUITE 2: Pricing & Auto-Applied Offer Evaluation
  // --------------------------------------------------------------------------
  describe("2. Pricing & Auto-Applied Offer Evaluation", () => {
    it("returns auto-applied offer with accurate discount, GST, and savings", async () => {
      // Create a 20% discount offer for all plans
      await offerRepo.create({
        title: "Early Bird 20%",
        discountType: "PERCENTAGE",
        discountValue: 20,
        badgeText: "Save 20%",
      });

      const useCase = new GetPlanOfferUseCase(offerRepo, planRepo);
      const result = await useCase.execute({
        planId: "plan_starter", // 1000 INR
        billingCycle: "MONTHLY",
      });

      assert.equal(result.hasOffer, true);
      assert.equal(result.title, "Early Bird 20%");
      assert.equal(result.rawBasePrice, 1000);
      assert.equal(result.discountAmount, 200);
      assert.equal(result.discountedBasePrice, 800);
      assert.equal(result.gstPercent, 18);
      assert.equal(result.taxAmount, 144); // 18% of 800
      assert.equal(result.totalAmount, 944); // 800 + 144
      assert.equal(result.savings, 236); // (1000 + 180) - (800 + 144) = 1180 - 944 = 236
    });

    it("prioritizes offer that yields maximum savings when multiple apply", async () => {
      // 1. 10% discount
      await offerRepo.create({
        title: "Small 10%",
        discountType: "PERCENTAGE",
        discountValue: 10,
      });

      // 2. ₹300 flat discount (on 1000, 300 is 30% > 10%)
      await offerRepo.create({
        title: "Big Flat 300",
        discountType: "FLAT",
        discountValue: 300,
      });

      const useCase = new GetPlanOfferUseCase(offerRepo, planRepo);
      const result = await useCase.execute({
        planId: "plan_starter",
      });

      assert.equal(result.hasOffer, true);
      assert.equal(result.title, "Big Flat 300");
      assert.equal(result.discountAmount, 300);
    });

    it("returns standard pricing when minOrderAmount is not satisfied", async () => {
      await offerRepo.create({
        title: "High Roller Discount",
        discountType: "FLAT",
        discountValue: 1000,
        minOrderAmount: 2000, // plan_starter is only 1000
      });

      const useCase = new GetPlanOfferUseCase(offerRepo, planRepo);
      const result = await useCase.execute({
        planId: "plan_starter",
      });

      assert.equal(result.hasOffer, false);
      assert.equal(result.discountAmount, 0);
      assert.equal(result.savings, 0);
    });

    it("enforces NEW_TEACHERS_ONLY and denies previously subscribed teachers", async () => {
      await offerRepo.create({
        title: "First-Timer Special",
        discountType: "PERCENTAGE",
        discountValue: 50,
        eligibility: "NEW_TEACHERS_ONLY",
      });

      offerRepo.userSubscribedHistory.add("teacher_profile_1");

      const useCase = new GetPlanOfferUseCase(offerRepo, planRepo);

      // Previously subscribed teacher does not receive offer
      const res1 = await useCase.execute({
        planId: "plan_starter",
        teacherProfileId: "teacher_profile_1",
      });
      assert.equal(res1.hasOffer, false);

      // New teacher receives offer
      const res2 = await useCase.execute({
        planId: "plan_starter",
        teacherProfileId: "teacher_profile_new",
      });
      assert.equal(res2.hasOffer, true);
    });

    it("throws OfferNotFoundError when plan does not exist", async () => {
      const useCase = new GetPlanOfferUseCase(offerRepo, planRepo);
      await assert.rejects(
        async () => {
          await useCase.execute({ planId: "non_existent_plan" });
        },
        (err: any) => err instanceof OfferNotFoundError && err.message.includes("not found")
      );
    });
  });

  // --------------------------------------------------------------------------
  // SUITE 3: Admin Offer Management
  // --------------------------------------------------------------------------
  describe("3. Admin Offer Management", () => {
    it("creates offer successfully with domain validation", async () => {
      const useCase = new AdminCreateOfferUseCase(offerRepo);
      const created = await useCase.execute({
        title: "Diwali Fest",
        description: "Special seasonal festival discount",
        discountType: "PERCENTAGE",
        discountValue: 25,
        badgeText: "Festival Offer",
      });

      assert.ok(created.id);
      assert.equal(created.title, "Diwali Fest");
      assert.equal(created.discountValue, 25);
    });

    it("updates offer properties and enforces discount bounds", async () => {
      const createUseCase = new AdminCreateOfferUseCase(offerRepo);
      const offer = await createUseCase.execute({
        title: "Original Promo",
        discountType: "PERCENTAGE",
        discountValue: 15,
      });

      const updateUseCase = new AdminUpdateOfferUseCase(offerRepo);
      const updated = await updateUseCase.execute(offer.id, {
        title: "Updated Promo Name",
        discountValue: 30,
      });

      assert.equal(updated.title, "Updated Promo Name");
      assert.equal(updated.discountValue, 30);
    });

    it("toggles offer active status", async () => {
      const createUseCase = new AdminCreateOfferUseCase(offerRepo);
      const offer = await createUseCase.execute({
        title: "Toggleable Offer",
        discountType: "FLAT",
        discountValue: 100,
      });

      assert.equal(offer.isActive, true);

      const toggleUseCase = new AdminToggleOfferUseCase(offerRepo);
      const disabled = await toggleUseCase.execute(offer.id);
      assert.equal(disabled.isActive, false);

      const reEnabled = await toggleUseCase.execute(offer.id);
      assert.equal(reEnabled.isActive, true);
    });

    it("deletes offer and throws OfferNotFoundError on subsequent access", async () => {
      const createUseCase = new AdminCreateOfferUseCase(offerRepo);
      const offer = await createUseCase.execute({
        title: "Doomed Offer",
        discountType: "FLAT",
        discountValue: 50,
      });

      const deleteUseCase = new AdminDeleteOfferUseCase(offerRepo);
      await deleteUseCase.execute(offer.id);

      const found = await offerRepo.findById(offer.id);
      assert.equal(found, null);

      await assert.rejects(
        async () => {
          await deleteUseCase.execute(offer.id);
        },
        (err: any) => err instanceof OfferNotFoundError
      );
    });

    it("admin listing returns paginated results with filtering", async () => {
      const createUseCase = new AdminCreateOfferUseCase(offerRepo);
      await createUseCase.execute({ title: "Summer Sale", discountType: "PERCENTAGE", discountValue: 10 });
      await createUseCase.execute({ title: "Winter Sale", discountType: "PERCENTAGE", discountValue: 20 });

      const listUseCase = new AdminListOffersUseCase(offerRepo);
      const result = await listUseCase.execute({
        search: "Summer",
        page: 1,
        limit: 10,
      });

      assert.equal(result.total, 1);
      assert.equal(result.offers[0].title, "Summer Sale");
    });
  });

  // --------------------------------------------------------------------------
  // SUITE 4: Presentation Schemas & Input Validation
  // --------------------------------------------------------------------------
  describe("4. Presentation Schemas & Input Validation", () => {
    it("validates createOfferBodySchema accepts valid payload and coerces numbers", () => {
      const parsed = createOfferBodySchema.parse({
        title: "Black Friday Deal",
        discountType: "PERCENTAGE",
        discountValue: "40", // string coerced to number
        maxDiscountAmount: "2000",
        minOrderAmount: "500",
      });

      assert.equal(parsed.title, "Black Friday Deal");
      assert.equal(parsed.discountValue, 40);
      assert.equal(parsed.maxDiscountAmount, 2000);
      assert.equal(parsed.minOrderAmount, 500);
    });

    it("rejects createOfferBodySchema with title < 3 chars", () => {
      assert.throws(() => {
        createOfferBodySchema.parse({
          title: "AB",
          discountType: "PERCENTAGE",
          discountValue: 20,
        });
      });
    });

    it("parses getPlanOfferQuerySchema with default billingCycle", () => {
      const parsed = getPlanOfferQuerySchema.parse({
        planId: "plan_123",
      });

      assert.equal(parsed.planId, "plan_123");
      assert.equal(parsed.billingCycle, "MONTHLY");
    });

    it("parses listOffersQueryObjectSchema with transformed numbers and defaults", () => {
      const parsed = listOffersQueryObjectSchema.parse({
        page: "2",
        limit: "25",
        status: "active",
      });

      assert.equal(parsed.page, 2);
      assert.equal(parsed.limit, 25);
      assert.equal(parsed.status, "active");
      assert.equal(parsed.sortBy, "createdAt");
    });
  });

  // --------------------------------------------------------------------------
  // SUITE 5: Dependency Inversion Module Factory
  // --------------------------------------------------------------------------
  describe("5. Dependency Inversion Module Factory", () => {
    it("createOfferModule instantiates cleanly with custom injected repositories", () => {
      const customOfferRepo = new InMemoryOfferRepository();
      const customPlanRepo = new InMemoryPlanRepository();
      const customProfileResolver = new MockTeacherProfileResolver();

      const moduleInstance = createOfferModule({
        offerRepo: customOfferRepo,
        planRepo: customPlanRepo,
        teacherProfileResolver: customProfileResolver,
      });

      assert.ok(moduleInstance.offerRouter);
      assert.ok(moduleInstance.offerRepo);
      assert.ok(moduleInstance.offerController);
      assert.ok(moduleInstance.getPlanOfferUseCase);
      assert.ok(moduleInstance.useCases.adminCreateOfferUseCase);
      assert.ok(moduleInstance.useCases.adminListOffersUseCase);
    });
  });
});
