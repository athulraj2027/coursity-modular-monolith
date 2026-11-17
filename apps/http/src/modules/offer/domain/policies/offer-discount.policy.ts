import { DiscountType } from "../entities/offer.entity";

export class OfferDiscountPolicy {
  /**
   * Computes the exact discount amount from base price and offer configuration
   */
  static calculateDiscount(params: {
    basePrice: number;
    discountType: DiscountType;
    discountValue: number;
    maxDiscountAmount?: number | null;
  }): number {
    const { basePrice, discountType, discountValue, maxDiscountAmount } = params;

    if (basePrice <= 0 || discountValue <= 0) {
      return 0;
    }

    let calculatedDiscount = 0;
    if (discountType === "PERCENTAGE") {
      calculatedDiscount = (basePrice * discountValue) / 100;
      if (maxDiscountAmount !== null && maxDiscountAmount !== undefined && maxDiscountAmount > 0) {
        calculatedDiscount = Math.min(calculatedDiscount, maxDiscountAmount);
      }
    } else if (discountType === "FLAT") {
      calculatedDiscount = discountValue;
    }

    // Discount cannot exceed the base price
    return Math.min(basePrice, Math.max(0, Math.round(calculatedDiscount * 100) / 100));
  }

  /**
   * Checks if an order satisfies the minimum order requirement
   */
  static meetsMinimumOrder(basePrice: number, minOrderAmount?: number | null): boolean {
    if (minOrderAmount === null || minOrderAmount === undefined || minOrderAmount <= 0) {
      return true;
    }
    return basePrice >= minOrderAmount;
  }
}
