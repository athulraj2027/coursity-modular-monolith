import { DiscountType, OfferEligibility, OfferEntity } from "../entities/offer.entity";
import { BillingCycle } from "@/modules/subscription/domain/entities/subscription.entity";

export interface GetPlanOfferInputDto {
  planId: string;
  billingCycle?: BillingCycle;
  teacherProfileId?: string;
  offerId?: string; // Optional explicit offerId to force specific offer
}

export interface PlanOfferResultDto {
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

export interface CreateOfferDto {
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
  validFrom?: Date | string;
  validUntil?: Date | string | null;
  isActive?: boolean;
  applicablePlanIds?: string[];
  applicableCycles?: BillingCycle[];
}

export interface UpdateOfferDto {
  title?: string;
  description?: string | null;
  discountType?: DiscountType;
  discountValue?: number;
  maxDiscountAmount?: number | null;
  minOrderAmount?: number | null;
  eligibility?: OfferEligibility;
  badgeText?: string | null;
  maxRedemptions?: number | null;
  maxRedemptionsPerUser?: number;
  validFrom?: Date | string;
  validUntil?: Date | string | null;
  isActive?: boolean;
  applicablePlanIds?: string[];
  applicableCycles?: BillingCycle[];
}

export interface ListOffersQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: "all" | "active" | "disabled" | "expired";
  discountType?: "all" | DiscountType;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface RecordRedemptionDto {
  offerId: string;
  teacherProfileId: string;
  subscriptionId?: string;
  invoiceId?: string;
  discountAmount: number;
  finalPaidAmount: number;
}

export interface OfferAnalyticsDto {
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
    redeemedAt: Date;
  }[];
}
