import { DiscountType, TeacherCouponEntity } from "../entities/teacher-coupon.entity";
import { BadRequestError } from "@/app/errors";

export interface CourseEligibilityContext {
  id: string;
  teacherProfileId: string;
  price: number;
  pricingType?: string;
}

export class CouponValidationPolicy {
  private static readonly CODE_REGEX = /^[A-Za-z0-9_-]{3,20}$/;

  /**
   * Normalizes coupon code to uppercase and trimmed string.
   */
  static normalizeCode(code: string): string {
    return code ? code.trim().toUpperCase() : "";
  }

  /**
   * Validates if a code conforms to standard coupon syntax.
   */
  static isValidCode(code: string): boolean {
    if (!code) return false;
    return this.CODE_REGEX.test(this.normalizeCode(code));
  }

  /**
   * Asserts validity of coupon creation/update input values.
   */
  static validateDiscountRules(
    discountType: DiscountType,
    discountValue: number,
    maxDiscountAmount?: number | null
  ): void {
    if (discountValue <= 0) {
      throw new BadRequestError("Discount value must be greater than zero.");
    }

    if (discountType === "PERCENTAGE" && discountValue > 100) {
      throw new BadRequestError("Percentage discount cannot exceed 100%.");
    }

    if (maxDiscountAmount !== undefined && maxDiscountAmount !== null && maxDiscountAmount <= 0) {
      throw new BadRequestError("Max discount amount must be greater than zero.");
    }
  }

  /**
   * Checks whether a coupon can be redeemed for a specific course and student.
   */
  static checkRedemptionEligibility(
    coupon: TeacherCouponEntity,
    course: CourseEligibilityContext,
    studentUses = 0,
    currentDate: Date = new Date()
  ): { isEligible: boolean; reason?: string } {
    if (course.pricingType === "FREE") {
      return { isEligible: false, reason: "Coupons cannot be applied to free courses." };
    }

    if (coupon.teacherProfileId !== course.teacherProfileId) {
      return { isEligible: false, reason: "This coupon is not valid for this instructor's courses." };
    }

    if (coupon.courseId && coupon.courseId !== course.id) {
      return { isEligible: false, reason: "This coupon is only valid for a specific live course." };
    }

    if (!coupon.isActive) {
      return { isEligible: false, reason: "This coupon is no longer active." };
    }

    if (coupon.validFrom && currentDate < coupon.validFrom) {
      return { isEligible: false, reason: "This coupon has not started yet." };
    }

    if (coupon.expiresAt && currentDate > coupon.expiresAt) {
      return { isEligible: false, reason: "This coupon has expired." };
    }

    if (coupon.minOrderAmount && course.price < coupon.minOrderAmount) {
      return {
        isEligible: false,
        reason: `Course price must be at least ₹${coupon.minOrderAmount} to use this coupon.`,
      };
    }

    if (coupon.maxUses !== null && coupon.maxUses !== undefined && coupon.usedCount >= coupon.maxUses) {
      return { isEligible: false, reason: "This coupon has reached its maximum redemption limit." };
    }

    if (studentUses >= coupon.maxUsesPerStudent) {
      return {
        isEligible: false,
        reason: "You have already used this coupon for an active enrollment.",
      };
    }

    return { isEligible: true };
  }
}

