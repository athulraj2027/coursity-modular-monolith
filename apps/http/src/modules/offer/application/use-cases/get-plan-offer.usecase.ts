import { IOfferRepository } from "../../domain/repositories/offer.repository";
import { PlanRepository } from "@/modules/plan/domain/repositories/plan.repository";
import { GetPlanOfferInputDto, PlanOfferResultDto } from "../../domain/dtos/offer.dto";
import {
  calculatePlanCheckoutPrice,
  calculateDiscountedCheckoutPrice,
  DEFAULT_GST_PERCENT,
} from "@/modules/subscription/domain/constants/billing.constants";
import { NotFoundError } from "@/app/errors";

export class GetPlanOfferUseCase {
  constructor(
    private readonly offerRepo: IOfferRepository,
    private readonly planRepo: PlanRepository
  ) {}

  async execute(dto: GetPlanOfferInputDto): Promise<PlanOfferResultDto> {
    const plan = await this.planRepo.findById(dto.planId);
    if (!plan) {
      throw new NotFoundError(`Plan with ID '${dto.planId}' not found.`);
    }

    const selectedCycle = dto.billingCycle || plan.billingCycle || "MONTHLY";
    const standardPricing = calculatePlanCheckoutPrice(
      Number(plan.price),
      selectedCycle,
      DEFAULT_GST_PERCENT
    );

    if (Number(plan.price) === 0) {
      return {
        hasOffer: false,
        rawBasePrice: 0,
        discountAmount: 0,
        discountedBasePrice: 0,
        gstPercent: DEFAULT_GST_PERCENT,
        taxAmount: 0,
        totalAmount: 0,
        savings: 0,
      };
    }

    // Fetch active offers for this plan and billing cycle
    let candidates = await this.offerRepo.findActiveOffers(plan.id, selectedCycle);

    // If a specific offer was requested by ID
    if (dto.offerId) {
      candidates = candidates.filter((o) => o.id === dto.offerId);
      if (candidates.length === 0) {
        const specific = await this.offerRepo.findById(dto.offerId);
        if (specific && specific.isActive) {
          candidates = [specific];
        }
      }
    }

    // Filter and score eligible candidates
    let bestOffer = null;
    let bestDiscounted = null;

    for (const offer of candidates) {
      // Check minimum order requirement
      if (offer.minOrderAmount !== null && offer.minOrderAmount !== undefined) {
        if (standardPricing.basePrice < offer.minOrderAmount) {
          continue;
        }
      }

      // Check teacher profile limits if teacher profile provided
      if (dto.teacherProfileId) {
        const redemptionCount = await this.offerRepo.findRedemptionCountByUser(
          offer.id,
          dto.teacherProfileId
        );
        if (redemptionCount >= offer.maxRedemptionsPerUser) {
          continue;
        }

        if (offer.eligibility === "NEW_TEACHERS_ONLY") {
          const hasSubscribed = await this.offerRepo.hasUserSubscribedBefore(
            dto.teacherProfileId
          );
          if (hasSubscribed) {
            continue;
          }
        }
      }

      const discounted = calculateDiscountedCheckoutPrice(
        standardPricing.basePrice,
        offer.discountType,
        Number(offer.discountValue),
        offer.maxDiscountAmount ? Number(offer.maxDiscountAmount) : null,
        DEFAULT_GST_PERCENT
      );

      if (!bestDiscounted || discounted.savings > bestDiscounted.savings) {
        bestDiscounted = discounted;
        bestOffer = offer;
      }
    }

    if (bestOffer && bestDiscounted && bestDiscounted.savings > 0) {
      return {
        hasOffer: true,
        offerId: bestOffer.id,
        title: bestOffer.title,
        badgeText: bestOffer.badgeText,
        discountType: bestOffer.discountType,
        discountValue: Number(bestOffer.discountValue),
        rawBasePrice: bestDiscounted.rawBasePrice,
        discountAmount: bestDiscounted.discountAmount,
        discountedBasePrice: bestDiscounted.discountedBasePrice,
        gstPercent: bestDiscounted.gstPercent,
        taxAmount: bestDiscounted.taxAmount,
        totalAmount: bestDiscounted.totalAmount,
        savings: bestDiscounted.savings,
        message: `Default offer '${bestOffer.title}' applied! You save ₹${bestDiscounted.savings.toLocaleString()}.`,
      };
    }

    return {
      hasOffer: false,
      rawBasePrice: standardPricing.basePrice,
      discountAmount: 0,
      discountedBasePrice: standardPricing.basePrice,
      gstPercent: DEFAULT_GST_PERCENT,
      taxAmount: standardPricing.taxAmount,
      totalAmount: standardPricing.totalAmount,
      savings: 0,
    };
  }
}
