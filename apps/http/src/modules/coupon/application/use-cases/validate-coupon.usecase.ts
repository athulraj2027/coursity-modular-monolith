import { ICouponValidationRepository } from "../../domain/repositories/teacher-coupon.repository";
import { ICourseRepository } from "@/modules/course/domain/repositories/course.repository";
import { ValidateCouponDto, CouponValidationResult } from "../../domain/dtos/teacher-coupon.dto";
import { CouponValidationPolicy } from "../../domain/policies/coupon-validation.policy";
import { CouponDiscountPolicy } from "../../domain/policies/coupon-discount.policy";
import { BadRequestError, NotFoundError } from "@/app/errors";

export class ValidateCouponUseCase {
  constructor(
    private readonly couponRepo: ICouponValidationRepository,
    private readonly courseRepo?: ICourseRepository
  ) {}

  async execute(dto: ValidateCouponDto): Promise<CouponValidationResult> {
    const course = this.courseRepo
      ? await this.courseRepo.findById(dto.courseId, true)
      : null;

    if (!course) {
      throw new NotFoundError("Course not found.");
    }

    if (course.pricingType === "FREE") {
      throw new BadRequestError("Coupons cannot be applied to free courses.");
    }

    const originalPrice = Number(course.price);
    const normalizedCode = CouponValidationPolicy.normalizeCode(dto.code);

    const coupon = await this.couponRepo.findByCode(normalizedCode);
    if (!coupon) {
      return {
        isValid: false,
        discountAmount: 0,
        originalPrice,
        finalPrice: originalPrice,
        message: `Coupon code '${dto.code}' is invalid or does not exist.`,
      };
    }

    // Get student redemptions count if studentId provided
    const studentUses = dto.studentId
      ? await this.couponRepo.getStudentUsageCount(coupon.id, dto.studentId)
      : 0;

    // Evaluate eligibility using pure domain validation policy
    const eligibility = CouponValidationPolicy.checkRedemptionEligibility(
      coupon,
      {
        id: course.id,
        teacherProfileId: course.teacherProfileId,
        price: originalPrice,
        pricingType: course.pricingType,
      },
      studentUses
    );

    if (!eligibility.isEligible) {
      return {
        isValid: false,
        discountAmount: 0,
        originalPrice,
        finalPrice: originalPrice,
        message: eligibility.reason,
      };
    }

    // Calculate discount using pure domain discount policy
    const { discountAmount, finalPrice } = CouponDiscountPolicy.calculateDiscount({
      originalPrice,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxDiscountAmount: coupon.maxDiscountAmount,
    });

    return {
      isValid: true,
      couponId: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      originalPrice,
      finalPrice,
      message: `Coupon '${coupon.code}' applied successfully! Saved ₹${discountAmount.toFixed(2)}.`,
    };
  }
}
