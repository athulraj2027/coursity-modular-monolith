export type DiscountType = "PERCENTAGE" | "FLAT";
export type OfferEligibility = "ALL_TEACHERS" | "NEW_TEACHERS_ONLY";
export type BillingCycle = "MONTHLY" | "QUARTERLY" | "YEARLY" | "LIFETIME";

export interface OfferPlan {
  id: string;
  offerId: string;
  planId: string;
  plan?: {
    id: string;
    name: string;
    slug: string;
    price: number | string;
  };
  createdAt: string;
}

export interface OfferBillingCycle {
  id: string;
  offerId: string;
  billingCycle: BillingCycle;
  createdAt: string;
}

export interface OfferRedemption {
  id: string;
  offerId: string;
  teacherProfileId: string;
  subscriptionId?: string | null;
  invoiceId?: string | null;
  discountAmount: number;
  finalPaidAmount: number;
  redeemedAt: string;
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

export interface Offer {
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
  validFrom: string;
  validUntil: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  applicablePlans?: OfferPlan[];
  applicableCycles?: OfferBillingCycle[];
  redemptions?: OfferRedemption[];
  _count?: {
    redemptions: number;
  };
}

export interface PlanOfferResult {
  hasOffer: boolean;
  offerId?: string;
  title?: string;
  badgeText?: string | null;
  discountType?: DiscountType;
  discountValue?: number;
  rawBasePrice: number;
  discountAmount: number;
  discountedBasePrice: number;
  gstPercent: number;
  taxAmount: number;
  totalAmount: number;
  savings: number;
  message?: string;
}

// Alias for seamless backward compatibility
export type ValidateOfferResult = PlanOfferResult;

export interface CreateOfferPayload {
  title: string;
  description?: string | null;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount?: number | null;
  minOrderAmount?: number | null;
  eligibility?: OfferEligibility;
  badgeText?: string | null;
  maxRedemptions?: number | null;
  maxRedemptionsPerUser?: number;
  validFrom?: string;
  validUntil?: string | null;
  isActive?: boolean;
  applicablePlanIds?: string[];
  applicableCycles?: BillingCycle[];
}

export interface UpdateOfferPayload extends Partial<CreateOfferPayload> {}

export interface AdminOffersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "all" | "active" | "disabled" | "expired";
  discountType?: "all" | DiscountType;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface OfferAnalytics {
  totalOffers: number;
  activeOffers: number;
  totalRedemptions: number;
  totalDiscountGiven: number;
  totalRevenueGenerated: number;
  recentRedemptions: {
    id: string;
    offerTitle: string;
    teacherName: string;
    teacherEmail: string;
    discountAmount: number;
    finalPaidAmount: number;
    redeemedAt: string;
  }[];
}
