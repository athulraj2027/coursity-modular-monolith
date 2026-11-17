import {
  IOfferQueryRepository,
  IPlanLookupRepository,
} from "../../domain/repositories/offer.repository";
import { GetPlanOfferInputDto, PlanOfferResultDto } from "../../domain/dtos/offer.dto";
import {
  calculatePlanCheckoutPrice,
  DEFAULT_GST_PERCENT,
} from "@/modules/subscription/domain/constants/billing.constants";
import { OfferNotFoundError } from "../../domain/errors/offer.errors";
import {
  OfferDiscountPolicy,
  OfferEligibilityPolicy,
} from "../../domain/policies";

export class GetPlanOfferUseCase {
  constructor(
    private readonly offerRepo: IOfferQueryRepository,
    private readonly planRepo: IPlanLookupRepository
  ) {}

  async execute(dto: GetPlanOfferInputDto): Promise<PlanOfferResultDto> {
    const plan = await this.planRepo.findById(dto.planId);
    if (!plan) {
      throw new OfferNotFoundError(`Plan with ID '${dto.planId}' not found.`);
    }

    const selectedCycle = (dto.billingCycle || plan.billingCycle || "MONTHLY") as any;
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
    let bestDiscountAmount = 0;

    for (const offer of candidates) {
      // 1. Check minimum order requirement
      if (!OfferDiscountPolicy.meetsMinimumOrder(standardPricing.basePrice, offer.minOrderAmount)) {
        continue;
      }

      // 2. Check global quota
      if (!OfferEligibilityPolicy.hasGlobalCapacity(offer.maxRedemptions, offer.usedRedemptions)) {
        continue;
      }

      // 3. Check teacher profile limits if teacher profile provided
      if (dto.teacherProfileId) {
        const redemptionCount = await this.offerRepo.findRedemptionCountByUser(
          offer.id,
          dto.teacherProfileId
        );
        if (!OfferEligibilityPolicy.hasUserCapacity(offer.maxRedemptionsPerUser, redemptionCount)) {
          continue;
        }

        if (offer.eligibility === "NEW_TEACHERS_ONLY") {
          const hasSubscribed = await this.offerRepo.hasUserSubscribedBefore(dto.teacherProfileId);
          if (!OfferEligibilityPolicy.isTeacherEligible(offer.eligibility, hasSubscribed)) {
            continue;
          }
        }
      }

      // 4. Calculate discount
      const discount = OfferDiscountPolicy.calculateDiscount({
        basePrice: standardPricing.basePrice,
        discountType: offer.discountType,
        discountValue: Number(offer.discountValue),
        maxDiscountAmount: offer.maxDiscountAmount ? Number(offer.maxDiscountAmount) : null,
      });

      if (discount > bestDiscountAmount) {
        bestDiscountAmount = discount;
        bestOffer = offer;
      }
    }

    if (bestOffer && bestDiscountAmount > 0) {
      const discountedBasePrice = Math.max(0, standardPricing.basePrice - bestDiscountAmount);
      const taxAmount = Math.round(((discountedBasePrice * DEFAULT_GST_PERCENT) / 100) * 100) / 100;
      const totalAmount = Math.round((discountedBasePrice + taxAmount) * 100) / 100;
      const savings = Math.round((standardPricing.totalAmount - totalAmount) * 100) / 100;

      return {
        hasOffer: true,
        offerId: bestOffer.id,
        title: bestOffer.title,
        badgeText: bestOffer.badgeText,
        discountType: bestOffer.discountType,
        discountValue: Number(bestOffer.discountValue),
        rawBasePrice: standardPricing.basePrice,
        discountAmount: bestDiscountAmount,
        discountedBasePrice,
        gstPercent: DEFAULT_GST_PERCENT,
        taxAmount,
        totalAmount,
        savings,
        message: `Default offer '${bestOffer.title}' applied! You save ₹${savings.toLocaleString()}.`,
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
