export type DiscountType = "PERCENTAGE" | "FLAT";
export type OfferEligibility = "ALL_TEACHERS" | "NEW_TEACHERS_ONLY";

export interface OfferPlanEntity {
  id: string;
  offerId: string;
  planId: string;
  plan?: {
    id: string;
    name: string;
    slug: string;
    price: number | string;
  };
  createdAt: Date;
}

export interface OfferBillingCycleEntity {
  id: string;
  offerId: string;
  billingCycle: "MONTHLY" | "QUARTERLY" | "YEARLY" | "LIFETIME";
  createdAt: Date;
}

export interface OfferRedemptionEntity {
  id: string;
  offerId: string;
  teacherProfileId: string;
  subscriptionId?: string | null;
  invoiceId?: string | null;
  discountAmount: number;
  finalPaidAmount: number;
  redeemedAt: Date;
  offer?: {
    id: string;
    title: string;
  };
  teacherProfile?: {
    id: string;
    profile?: {
      user?: {
        name: string;
        email: string;
      };
    };
  };
}

export interface OfferEntity {
  id: string;
  title: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount: number | null;
  minOrderAmount: number | null;
  eligibility: OfferEligibility;
  badgeText: string | null;
  maxRedemptions: number | null;
  usedRedemptions: number;
  maxRedemptionsPerUser: number;
  validFrom: Date;
  validUntil: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  applicablePlans?: OfferPlanEntity[];
  applicableCycles?: OfferBillingCycleEntity[];
  redemptions?: OfferRedemptionEntity[];
  _count?: {
    redemptions: number;
  };
}
