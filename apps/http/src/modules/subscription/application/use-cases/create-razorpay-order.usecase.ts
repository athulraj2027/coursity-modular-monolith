import { PlanRepository } from "@/modules/plan/domain/repositories/plan.repository";
import { IPaymentGateway } from "@/infrastructure/payment";
import { GetPlanOfferUseCase } from "@/modules/offer/application/use-cases/get-plan-offer.usecase";
import { CreateRazorpayOrderDto, RazorpayOrderResponseDto } from "../../domain/dtos/subscription.dto";
import { calculatePlanCheckoutPrice, DEFAULT_GST_PERCENT } from "../../domain/constants/billing.constants";
import { BadRequestError, NotFoundError } from "@/app/errors";

export class CreateRazorpayOrderUseCase {
  constructor(
    private readonly planRepo: PlanRepository,
    private readonly paymentGateway: IPaymentGateway,
    private readonly getPlanOfferUseCase?: GetPlanOfferUseCase
  ) {}

  async execute(dto: CreateRazorpayOrderDto): Promise<RazorpayOrderResponseDto> {
    const plan = await this.planRepo.findById(dto.planId);
    if (!plan) {
      throw new NotFoundError(`Plan with ID '${dto.planId}' does not exist.`);
    }

    if (!plan.isActive) {
      throw new BadRequestError(`Plan '${plan.name}' is not currently available for subscriptions.`);
    }

    // Determine billing cycle
    const selectedCycle = dto.billingCycle || plan.billingCycle || "MONTHLY";
    let finalBasePrice: number;
    let finalTaxAmount: number;
    let finalTotalAmount: number;
    let appliedOfferInfo: { offerId: string; title?: string; discountAmount: number; savings: number } | undefined = undefined;

    // Automatically resolve active promotional default offer
    if (this.getPlanOfferUseCase) {
      const planOffer = await this.getPlanOfferUseCase.execute({
        planId: plan.id,
        billingCycle: selectedCycle,
        teacherProfileId: dto.teacherProfileId,
        offerId: dto.offerId,
      });

      if (planOffer.hasOffer && planOffer.offerId) {
        finalBasePrice = planOffer.discountedBasePrice;
        finalTaxAmount = planOffer.taxAmount;
        finalTotalAmount = planOffer.totalAmount;
        appliedOfferInfo = {
          offerId: planOffer.offerId,
          title: planOffer.title,
          discountAmount: planOffer.discountAmount,
          savings: planOffer.savings,
        };
      } else {
        const standardPricing = calculatePlanCheckoutPrice(Number(plan.price), selectedCycle, DEFAULT_GST_PERCENT);
        finalBasePrice = standardPricing.basePrice;
        finalTaxAmount = standardPricing.taxAmount;
        finalTotalAmount = standardPricing.totalAmount;
      }
    } else {
      const standardPricing = calculatePlanCheckoutPrice(Number(plan.price), selectedCycle, DEFAULT_GST_PERCENT);
      finalBasePrice = standardPricing.basePrice;
      finalTaxAmount = standardPricing.taxAmount;
      finalTotalAmount = standardPricing.totalAmount;
    }

    const receipt = `rcpt_${dto.teacherProfileId.substring(0, 8)}_${Date.now().toString().slice(-6)}`;

    const orderResult = await this.paymentGateway.createOrder({
      amount: finalTotalAmount, // Razorpay order amount INCLUDES dynamic GST tax & applied discount
      currency: "INR",
      receipt,
      notes: {
        teacherProfileId: dto.teacherProfileId,
        planId: plan.id,
        planName: plan.name,
        billingCycle: selectedCycle,
        basePrice: finalBasePrice.toString(),
        taxAmount: finalTaxAmount.toString(),
        totalAmount: finalTotalAmount.toString(),
        gstPercent: DEFAULT_GST_PERCENT.toString(),
        offerId: appliedOfferInfo?.offerId || "",
        offerTitle: appliedOfferInfo?.title || "",
        discountAmount: appliedOfferInfo?.discountAmount.toString() || "0",
        userEmail: dto.userEmail,
        userName: dto.userName,
        phone: dto.phone || "",
        state: dto.state || "",
        country: dto.country || "India",
        gstin: dto.gstin || "",
      },
    });

    return {
      orderId: orderResult.orderId,
      amount: finalTotalAmount,
      currency: orderResult.currency,
      keyId: orderResult.keyId,
      planName: plan.name,
      planSlug: plan.slug,
      billingCycle: selectedCycle,
      isMock: !this.paymentGateway.isConfigured() || orderResult.orderId.startsWith("order_mock_"),
      offerApplied: appliedOfferInfo,
    };
  }
}
