import { DiscountType } from "../entities/teacher-coupon.entity";

export interface CalculateDiscountParams {
  originalPrice: number;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount?: number | null;
}

export interface DiscountCalculationResult {
  discountAmount: number;
  finalPrice: number;
}

export class CouponDiscountPolicy {
  /**
   * Calculates the exact discount amount and net final price given coupon parameters.
   */
  static calculateDiscount(params: CalculateDiscountParams): DiscountCalculationResult {
    const { originalPrice, discountType, discountValue, maxDiscountAmount } = params;

    if (originalPrice <= 0) {
      return { discountAmount: 0, finalPrice: 0 };
    }

    let calculatedDiscount = 0;

    if (discountType === "PERCENTAGE") {
      calculatedDiscount = (originalPrice * discountValue) / 100;
      if (maxDiscountAmount && maxDiscountAmount > 0 && calculatedDiscount > maxDiscountAmount) {
        calculatedDiscount = maxDiscountAmount;
      }
    } else {
      calculatedDiscount = discountValue;
    }

    // Guard: discount cannot exceed original price, cannot be negative
    const discountAmount = Number(
      Math.min(Math.max(0, calculatedDiscount), originalPrice).toFixed(2)
    );
    const finalPrice = Number(Math.max(0, originalPrice - discountAmount).toFixed(2));

    return {
      discountAmount,
      finalPrice,
    };
  }
}

