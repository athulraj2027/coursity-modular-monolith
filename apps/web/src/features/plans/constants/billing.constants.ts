import type { BillingCycle } from "../types/plan.types";

/**
 * Dynamic GST percentage applicable for subscriptions in India (18%).
 */
export const DEFAULT_GST_PERCENT = 18;

export interface PlanPricingBreakdown {
  rawPriceInRupees: number;
  monthlyCalculated: number;
  basePrice: number;
  gstPercent: number;
  taxAmount: number;
  totalAmount: number;
}

/**
 * Calculates standardized base price, dynamic GST amount, and total checkout charge.
 */
export function calculatePlanCheckoutPrice(
  rawPrice: number,
  billingCycle: BillingCycle = "MONTHLY",
  gstPercent: number = DEFAULT_GST_PERCENT
): PlanPricingBreakdown {
  const isFree = rawPrice === 0;
  // DB stores price in paise (e.g. 349900 = ₹3,499.00) or standard rupees
  const rawPriceInRupees = rawPrice >= 100 ? rawPrice / 100 : rawPrice;

  let monthlyCalculated = rawPriceInRupees;
  let basePrice = rawPriceInRupees;

  if (billingCycle === "YEARLY") {
    monthlyCalculated = Math.round(rawPriceInRupees * 0.8); // 20% discount on yearly
    basePrice = monthlyCalculated * 12;
  } else if (billingCycle === "QUARTERLY") {
    monthlyCalculated = Math.round(rawPriceInRupees * 0.9); // 10% discount on quarterly
    basePrice = monthlyCalculated * 3;
  } else {
    monthlyCalculated = rawPriceInRupees;
    basePrice = rawPriceInRupees;
  }

  const taxAmount = isFree ? 0 : Math.round(basePrice * (gstPercent / 100) * 100) / 100;
  const totalAmount = isFree ? 0 : Math.round((basePrice + taxAmount) * 100) / 100;

  return {
    rawPriceInRupees,
    monthlyCalculated,
    basePrice,
    gstPercent,
    taxAmount,
    totalAmount,
  };
}

export interface DiscountedPricingBreakdown {
  rawBasePrice: number;
  discountAmount: number;
  discountedBasePrice: number;
  gstPercent: number;
  taxAmount: number;
  totalAmount: number;
  savings: number;
}

/**
 * Computes discount deduction on base price prior to dynamic GST application.
 */
export function calculateDiscountedCheckoutPrice(
  rawBasePrice: number,
  discountType: "PERCENTAGE" | "FLAT",
  discountValue: number,
  maxDiscountAmount: number | null = null,
  gstPercent: number = DEFAULT_GST_PERCENT
): DiscountedPricingBreakdown {
  let discountAmount = 0;

  if (discountType === "PERCENTAGE") {
    discountAmount = (rawBasePrice * discountValue) / 100;
    if (maxDiscountAmount !== null && maxDiscountAmount !== undefined && discountAmount > maxDiscountAmount) {
      discountAmount = maxDiscountAmount;
    }
  } else {
    discountAmount = discountValue;
  }

  // Ensure discount doesn't exceed base price
  discountAmount = Math.min(discountAmount, rawBasePrice);
  const discountedBasePrice = Math.max(0, rawBasePrice - discountAmount);

  // Dynamic GST calculated on discounted base price
  const taxAmount = rawBasePrice === 0 ? 0 : Math.round(discountedBasePrice * (gstPercent / 100) * 100) / 100;
  const totalAmount = rawBasePrice === 0 ? 0 : Math.round((discountedBasePrice + taxAmount) * 100) / 100;

  return {
    rawBasePrice,
    discountAmount: Math.round(discountAmount * 100) / 100,
    discountedBasePrice: Math.round(discountedBasePrice * 100) / 100,
    gstPercent,
    taxAmount,
    totalAmount,
    savings: Math.round(discountAmount * 100) / 100,
  };
}
