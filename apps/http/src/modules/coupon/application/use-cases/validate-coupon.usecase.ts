import { TeacherCouponRepository } from "../../domain/repositories/teacher-coupon.repository";
import { ICourseRepository } from "@/modules/course/domain/repositories/course.repository";
import { ValidateCouponDto, CouponValidationResult } from "../../domain/dtos/teacher-coupon.dto";
import { BadRequestError, NotFoundError } from "@/app/errors";

export class ValidateCouponUseCase {
  constructor(
    private readonly couponRepo: TeacherCouponRepository,
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

    const coupon = await this.couponRepo.findByCode(dto.code);
    if (!coupon) {
      return {
        isValid: false,
        discountAmount: 0,
        originalPrice,
        finalPrice: originalPrice,
        message: `Coupon code '${dto.code}' is invalid or does not exist.`,
      };
    }

    // Check if coupon belongs to the course's teacher
    if (coupon.teacherProfileId !== course.teacherProfileId) {
      return {
        isValid: false,
        discountAmount: 0,
        originalPrice,
        finalPrice: originalPrice,
        message: "This coupon is not valid for this instructor's courses.",
      };
    }

    // Check if scoped to a specific course
    if (coupon.courseId && coupon.courseId !== course.id) {
      return {
        isValid: false,
        discountAmount: 0,
        originalPrice,
        finalPrice: originalPrice,
        message: "This coupon is only valid for a specific live course.",
      };
    }

    // Check active status
    if (!coupon.isActive) {
      return {
        isValid: false,
        discountAmount: 0,
        originalPrice,
        finalPrice: originalPrice,
        message: "This coupon is no longer active.",
      };
    }

    // Check validity dates
    const now = new Date();
    if (coupon.validFrom && now < coupon.validFrom) {
      return {
        isValid: false,
        discountAmount: 0,
        originalPrice,
        finalPrice: originalPrice,
        message: "This coupon has not started yet.",
      };
    }

    if (coupon.expiresAt && now > coupon.expiresAt) {
      return {
        isValid: false,
        discountAmount: 0,
        originalPrice,
        finalPrice: originalPrice,
        message: "This coupon has expired.",
      };
    }

    // Check min order amount
    if (coupon.minOrderAmount && originalPrice < coupon.minOrderAmount) {
      return {
        isValid: false,
        discountAmount: 0,
        originalPrice,
        finalPrice: originalPrice,
        message: `Course price must be at least ₹${coupon.minOrderAmount} to use this coupon.`,
      };
    }

    // Check max total uses
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return {
        isValid: false,
        discountAmount: 0,
        originalPrice,
        finalPrice: originalPrice,
        message: "This coupon has reached its maximum redemption limit.",
      };
    }

    // Check per-student usage
    if (dto.studentId) {
      const studentUses = await this.couponRepo.getStudentUsageCount(coupon.id, dto.studentId);
      if (studentUses >= coupon.maxUsesPerStudent) {
        return {
          isValid: false,
          discountAmount: 0,
          originalPrice,
          finalPrice: originalPrice,
          message: "You have already used this coupon for an active enrollment.",
        };
      }
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = (originalPrice * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    // Ensure discount does not exceed original price
    discountAmount = Math.min(discountAmount, originalPrice);
    const finalPrice = Math.max(0, originalPrice - discountAmount);

    return {
      isValid: true,
      couponId: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: Number(discountAmount.toFixed(2)),
      originalPrice,
      finalPrice: Number(finalPrice.toFixed(2)),
      message: `Coupon '${coupon.code}' applied successfully! Saved ₹${discountAmount.toFixed(2)}.`,
    };
  }
}
