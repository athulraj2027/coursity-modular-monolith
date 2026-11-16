import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  TeacherCouponEntity,
  CouponDetailsWithRedemptions,
  CouponDiscountPolicy,
  CouponValidationPolicy,
  CreateTeacherCouponUseCase,
  UpdateTeacherCouponUseCase,
  DeleteTeacherCouponUseCase,
  GetCouponByIdUseCase,
  ValidateCouponUseCase,
  AdminGetCouponsUseCase,
  AdminToggleCouponStatusUseCase,
  AdminDeleteCouponUseCase,
  ICouponValidationRepository,
  ITeacherCouponRepository,
  IAdminCouponRepository,
  CreateTeacherCouponDto,
  UpdateTeacherCouponDto,
  AdminCouponFilterParams,
  AdminCouponsListResult,
} from "../src/modules/coupon";
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from "../src/app/errors";

class MockCouponRepository
  implements ICouponValidationRepository, ITeacherCouponRepository, IAdminCouponRepository
{
  public records: Map<string, TeacherCouponEntity> = new Map();
  public studentUsage: Map<string, number> = new Map();

  async create(teacherProfileId: string, data: CreateTeacherCouponDto): Promise<TeacherCouponEntity> {
    const id = `cpn_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const entity = new TeacherCouponEntity({
      id,
      code: data.code,
      description: data.description ?? null,
      discountType: data.discountType,
      discountValue: data.discountValue,
      maxDiscountAmount: data.maxDiscountAmount ?? null,
      minOrderAmount: data.minOrderAmount ?? null,
      teacherProfileId,
      courseId: data.courseId ?? null,
      maxUses: data.maxUses ?? null,
      usedCount: 0,
      maxUsesPerStudent: data.maxUsesPerStudent ?? 1,
      validFrom: data.validFrom ?? new Date(),
      expiresAt: data.expiresAt ?? null,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    this.records.set(id, entity);
    return entity;
  }

  async findById(id: string): Promise<TeacherCouponEntity | null> {
    return this.records.get(id) || null;
  }

  async findByCodeAndTeacher(teacherProfileId: string, code: string): Promise<TeacherCouponEntity | null> {
    for (const c of this.records.values()) {
      if (c.teacherProfileId === teacherProfileId && c.code === code) {
        return c;
      }
    }
    return null;
  }

  async findByCode(code: string): Promise<TeacherCouponEntity | null> {
    for (const c of this.records.values()) {
      if (c.code === code) {
        return c;
      }
    }
    return null;
  }

  async listByTeacher(
    teacherProfileId: string,
    options?: { courseId?: string; isActive?: boolean }
  ): Promise<TeacherCouponEntity[]> {
    let list = Array.from(this.records.values()).filter((c) => c.teacherProfileId === teacherProfileId);
    if (options?.courseId) list = list.filter((c) => c.courseId === options.courseId);
    if (options?.isActive !== undefined) list = list.filter((c) => c.isActive === options.isActive);
    return list;
  }

  async update(id: string, data: UpdateTeacherCouponDto): Promise<TeacherCouponEntity> {
    const existing = this.records.get(id);
    if (!existing) throw new NotFoundError("Coupon not found");

    const updated = new TeacherCouponEntity({
      ...existing,
      description: data.description !== undefined ? data.description : existing.description,
      discountType: data.discountType ?? existing.discountType,
      discountValue: data.discountValue !== undefined ? data.discountValue : existing.discountValue,
      maxDiscountAmount:
        data.maxDiscountAmount !== undefined ? data.maxDiscountAmount : existing.maxDiscountAmount,
      minOrderAmount: data.minOrderAmount !== undefined ? data.minOrderAmount : existing.minOrderAmount,
      courseId: data.courseId !== undefined ? data.courseId : existing.courseId,
      maxUses: data.maxUses !== undefined ? data.maxUses : existing.maxUses,
      maxUsesPerStudent:
        data.maxUsesPerStudent !== undefined ? data.maxUsesPerStudent : existing.maxUsesPerStudent,
      validFrom: data.validFrom ?? existing.validFrom,
      expiresAt: data.expiresAt !== undefined ? data.expiresAt : existing.expiresAt,
      isActive: data.isActive !== undefined ? data.isActive : existing.isActive,
      updatedAt: new Date(),
    });

    this.records.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.records.delete(id);
  }

  async incrementUsedCount(id: string): Promise<void> {
    const existing = this.records.get(id);
    if (existing) {
      existing.usedCount += 1;
    }
  }

  async getStudentUsageCount(couponId: string, studentId: string): Promise<number> {
    const key = `${couponId}_${studentId}`;
    return this.studentUsage.get(key) || 0;
  }

  async findCouponWithRedemptions(id: string): Promise<CouponDetailsWithRedemptions | null> {
    const coupon = this.records.get(id);
    if (!coupon) return null;

    return {
      ...coupon,
      redemptions: [],
    };
  }

  async listAllCoupons(filters?: AdminCouponFilterParams): Promise<AdminCouponsListResult> {
    const all = Array.from(this.records.values());
    return {
      items: all,
      total: all.length,
      metrics: {
        totalCoupons: all.length,
        activeCoupons: all.filter((c) => c.isActive).length,
        totalRedemptions: all.reduce((sum, c) => sum + c.usedCount, 0),
        totalDiscountGiven: 0,
      },
    };
  }
}

describe("Coupon Module Clean Architecture & SOLID Principles Suite", () => {
  describe("1. CouponDiscountPolicy (Pure Domain Calculations)", () => {
    it("should calculate percentage discount accurately without cap", () => {
      const res = CouponDiscountPolicy.calculateDiscount({
        originalPrice: 1000,
        discountType: "PERCENTAGE",
        discountValue: 20,
      });

      assert.equal(res.discountAmount, 200);
      assert.equal(res.finalPrice, 800);
    });

    it("should respect maxDiscountAmount cap for percentage discounts", () => {
      const res = CouponDiscountPolicy.calculateDiscount({
        originalPrice: 5000,
        discountType: "PERCENTAGE",
        discountValue: 20, // 20% of 5000 is 1000
        maxDiscountAmount: 500, // Capped at 500
      });

      assert.equal(res.discountAmount, 500);
      assert.equal(res.finalPrice, 4500);
    });

    it("should calculate flat discounts accurately", () => {
      const res = CouponDiscountPolicy.calculateDiscount({
        originalPrice: 1000,
        discountType: "FLAT",
        discountValue: 350,
      });

      assert.equal(res.discountAmount, 350);
      assert.equal(res.finalPrice, 650);
    });

    it("should clamp discount so it cannot exceed the original price", () => {
      const res = CouponDiscountPolicy.calculateDiscount({
        originalPrice: 300,
        discountType: "FLAT",
        discountValue: 500, // discount > price
      });

      assert.equal(res.discountAmount, 300);
      assert.equal(res.finalPrice, 0);
    });
  });

  describe("2. CouponValidationPolicy (Domain Rules & Formats)", () => {
    it("should normalize code to uppercase and trimmed string", () => {
      assert.equal(CouponValidationPolicy.normalizeCode("  react20  "), "REACT20");
    });

    it("should validate allowed coupon code formats (3-20 alphanumeric chars, hyphens, underscores)", () => {
      assert.equal(CouponValidationPolicy.isValidCode("SPRING50"), true);
      assert.equal(CouponValidationPolicy.isValidCode("DEV-OPS_2026"), true);
      assert.equal(CouponValidationPolicy.isValidCode("AB"), false); // too short
      assert.equal(CouponValidationPolicy.isValidCode("CODE_WITH_TOO_MANY_CHARACTERS_HERE"), false); // >20
      assert.equal(CouponValidationPolicy.isValidCode("REACT 20"), false); // spaces not allowed
      assert.equal(CouponValidationPolicy.isValidCode("REACT@20"), false); // special char
    });

    it("should reject discountValue <= 0 or percentage > 100", () => {
      assert.throws(() => {
        CouponValidationPolicy.validateDiscountRules("PERCENTAGE", 0);
      }, BadRequestError);

      assert.throws(() => {
        CouponValidationPolicy.validateDiscountRules("PERCENTAGE", 101);
      }, BadRequestError);

      assert.throws(() => {
        CouponValidationPolicy.validateDiscountRules("FLAT", -50);
      }, BadRequestError);
    });

    it("should correctly check redemption eligibility", () => {
      const coupon = new TeacherCouponEntity({
        id: "c1",
        code: "TEST10",
        discountType: "PERCENTAGE",
        discountValue: 10,
        teacherProfileId: "teacher_1",
        courseId: "course_1",
        isActive: true,
        maxUses: 10,
        usedCount: 0,
        maxUsesPerStudent: 1,
        minOrderAmount: 500,
      });

      // Free course rejected
      const freeCourse = CouponValidationPolicy.checkRedemptionEligibility(
        coupon,
        { id: "course_1", teacherProfileId: "teacher_1", price: 0, pricingType: "FREE" },
        0
      );
      assert.equal(freeCourse.isEligible, false);

      // Wrong teacher rejected
      const wrongTeacher = CouponValidationPolicy.checkRedemptionEligibility(
        coupon,
        { id: "course_1", teacherProfileId: "teacher_2", price: 1000 },
        0
      );
      assert.equal(wrongTeacher.isEligible, false);

      // Wrong course rejected
      const wrongCourse = CouponValidationPolicy.checkRedemptionEligibility(
        coupon,
        { id: "course_2", teacherProfileId: "teacher_1", price: 1000 },
        0
      );
      assert.equal(wrongCourse.isEligible, false);

      // Below minOrderAmount rejected
      const belowMin = CouponValidationPolicy.checkRedemptionEligibility(
        coupon,
        { id: "course_1", teacherProfileId: "teacher_1", price: 400 },
        0
      );
      assert.equal(belowMin.isEligible, false);

      // Exceeded student uses rejected
      const exceededStudent = CouponValidationPolicy.checkRedemptionEligibility(
        coupon,
        { id: "course_1", teacherProfileId: "teacher_1", price: 1000 },
        1
      );
      assert.equal(exceededStudent.isEligible, false);

      // Valid case passes
      const valid = CouponValidationPolicy.checkRedemptionEligibility(
        coupon,
        { id: "course_1", teacherProfileId: "teacher_1", price: 1000 },
        0
      );
      assert.equal(valid.isEligible, true);
    });
  });

  describe("3. Teacher Coupon Studio Use Cases", () => {
    it("CreateTeacherCouponUseCase: creates coupon with normalized code and checks duplicates", async () => {
      const repo = new MockCouponRepository();
      const useCase = new CreateTeacherCouponUseCase(repo);

      const created = await useCase.execute("teacher_1", {
        code: "  summer25  ",
        discountType: "PERCENTAGE",
        discountValue: 25,
      });

      assert.equal(created.code, "SUMMER25");
      assert.equal(created.teacherProfileId, "teacher_1");

      // Duplicate code for same teacher throws ConflictError
      await assert.rejects(async () => {
        await useCase.execute("teacher_1", {
          code: "SUMMER25",
          discountType: "PERCENTAGE",
          discountValue: 10,
        });
      }, ConflictError);

      // Same code for different teacher succeeds
      const otherTeacher = await useCase.execute("teacher_2", {
        code: "SUMMER25",
        discountType: "PERCENTAGE",
        discountValue: 10,
      });
      assert.equal(otherTeacher.teacherProfileId, "teacher_2");
    });

    it("UpdateTeacherCouponUseCase: enforces ownership and throws ForbiddenError for other teachers", async () => {
      const repo = new MockCouponRepository();
      const coupon = await repo.create("teacher_1", {
        code: "UPDATE10",
        discountType: "PERCENTAGE",
        discountValue: 10,
      });

      const updateUseCase = new UpdateTeacherCouponUseCase(repo);

      // Ownership mismatch throws ForbiddenError
      await assert.rejects(async () => {
        await updateUseCase.execute("teacher_attacker", coupon.id, {
          discountValue: 50,
        });
      }, ForbiddenError);

      // Owner update succeeds
      const updated = await updateUseCase.execute("teacher_1", coupon.id, {
        discountValue: 15,
      });
      assert.equal(updated.discountValue, 15);
    });

    it("DeleteTeacherCouponUseCase: soft-deactivates coupon and enforces ownership", async () => {
      const repo = new MockCouponRepository();
      const coupon = await repo.create("teacher_1", {
        code: "DEL10",
        discountType: "PERCENTAGE",
        discountValue: 10,
      });

      const deleteUseCase = new DeleteTeacherCouponUseCase(repo);

      // Ownership mismatch throws ForbiddenError
      await assert.rejects(async () => {
        await deleteUseCase.execute("teacher_attacker", coupon.id);
      }, ForbiddenError);

      // Owner delete soft-deactivates
      await deleteUseCase.execute("teacher_1", coupon.id);
      const refreshed = await repo.findById(coupon.id);
      assert.equal(refreshed?.isActive, false);
    });

    it("GetCouponByIdUseCase: verifies ownership and allows admin bypass", async () => {
      const repo = new MockCouponRepository();
      const coupon = await repo.create("teacher_1", {
        code: "VIEW10",
        discountType: "PERCENTAGE",
        discountValue: 10,
      });

      const getUseCase = new GetCouponByIdUseCase(repo);

      // Owner can view
      const viewOwner = await getUseCase.execute(coupon.id, {
        teacherProfileId: "teacher_1",
      });
      assert.equal(viewOwner.id, coupon.id);

      // Non-owner without admin privileges throws ForbiddenError
      await assert.rejects(async () => {
        await getUseCase.execute(coupon.id, {
          teacherProfileId: "teacher_other",
          isAdmin: false,
        });
      }, ForbiddenError);

      // Admin bypass can view any coupon
      const viewAdmin = await getUseCase.execute(coupon.id, {
        isAdmin: true,
      });
      assert.equal(viewAdmin.id, coupon.id);
    });
  });

  describe("4. Student Checkout Validation (ValidateCouponUseCase)", () => {
    it("should validate and compute discount using policies", async () => {
      const repo = new MockCouponRepository();
      const coupon = await repo.create("teacher_1", {
        code: "FLAT200",
        discountType: "FLAT",
        discountValue: 200,
      });

      const mockCourseRepo = {
        findById: async (id: string) => ({
          id,
          teacherProfileId: "teacher_1",
          price: 999,
          pricingType: "PAID",
        }),
      } as any;

      const validateUseCase = new ValidateCouponUseCase(repo, mockCourseRepo);
      const result = await validateUseCase.execute({
        code: "flat200", // test lowercase input normalization
        courseId: "course_123",
        studentId: "student_abc",
      });

      assert.equal(result.isValid, true);
      assert.equal(result.discountAmount, 200);
      assert.equal(result.originalPrice, 999);
      assert.equal(result.finalPrice, 799);
      assert.equal(result.couponId, coupon.id);
    });
  });

  describe("5. Admin Management Use Cases", () => {
    it("AdminToggleCouponStatusUseCase: toggles coupon status", async () => {
      const repo = new MockCouponRepository();
      const coupon = await repo.create("teacher_1", {
        code: "TOGGLE10",
        discountType: "PERCENTAGE",
        discountValue: 10,
        isActive: true,
      });

      const toggleUseCase = new AdminToggleCouponStatusUseCase(repo);
      const deactivated = await toggleUseCase.execute(coupon.id, false);
      assert.equal(deactivated.isActive, false);

      const reactivated = await toggleUseCase.execute(coupon.id, true);
      assert.equal(reactivated.isActive, true);
    });

    it("AdminDeleteCouponUseCase: permanently deletes coupon", async () => {
      const repo = new MockCouponRepository();
      const coupon = await repo.create("teacher_1", {
        code: "PERM10",
        discountType: "PERCENTAGE",
        discountValue: 10,
      });

      const deleteUseCase = new AdminDeleteCouponUseCase(repo);
      const success = await deleteUseCase.execute(coupon.id);
      assert.equal(success, true);

      assert.equal(await repo.findById(coupon.id), null);
    });

    it("AdminGetCouponsUseCase: returns all coupons with metrics summary", async () => {
      const repo = new MockCouponRepository();
      await repo.create("teacher_1", { code: "C1", discountType: "PERCENTAGE", discountValue: 10 });
      await repo.create("teacher_2", { code: "C2", discountType: "FLAT", discountValue: 100 });

      const adminGetUseCase = new AdminGetCouponsUseCase(repo);
      const result = await adminGetUseCase.execute();

      assert.equal(result.total, 2);
      assert.equal(result.metrics.totalCoupons, 2);
      assert.equal(result.metrics.activeCoupons, 2);
    });
  });
});

