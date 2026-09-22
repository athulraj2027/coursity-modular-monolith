import { PlanRepository } from "@/modules/plan/domain/repositories/plan.repository";
import { IPaymentGateway } from "@/infrastructure/payment";
import { CreateRazorpayOrderDto, RazorpayOrderResponseDto } from "../../domain/dtos/subscription.dto";
import { calculatePlanCheckoutPrice, DEFAULT_GST_PERCENT } from "../../domain/constants/billing.constants";
import { BadRequestError, NotFoundError } from "@/app/errors";

export class CreateRazorpayOrderUseCase {
  constructor(
    private readonly planRepo: PlanRepository,
    private readonly paymentGateway: IPaymentGateway
  ) {}

  async execute(dto: CreateRazorpayOrderDto): Promise<RazorpayOrderResponseDto> {
    const plan = await this.planRepo.findById(dto.planId);
    if (!plan) {
      throw new NotFoundError(`Plan with ID '${dto.planId}' does not exist.`);
    }

    if (!plan.isActive) {
      throw new BadRequestError(`Plan '${plan.name}' is not currently available for subscriptions.`);
    }

    // Determine billing cycle & final amount with dynamic GST
    const selectedCycle = dto.billingCycle || plan.billingCycle || "MONTHLY";
    const pricing = calculatePlanCheckoutPrice(Number(plan.price), selectedCycle, DEFAULT_GST_PERCENT);

    const receipt = `rcpt_${dto.teacherProfileId.substring(0, 8)}_${Date.now().toString().slice(-6)}`;

    const orderResult = await this.paymentGateway.createOrder({
      amount: pricing.totalAmount, // Razorpay order amount INCLUDES dynamic GST tax
      currency: "INR",
      receipt,
      notes: {
        teacherProfileId: dto.teacherProfileId,
        planId: plan.id,
        planName: plan.name,
        billingCycle: selectedCycle,
        basePrice: pricing.basePrice.toString(),
        taxAmount: pricing.taxAmount.toString(),
        totalAmount: pricing.totalAmount.toString(),
        gstPercent: DEFAULT_GST_PERCENT.toString(),
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
      amount: pricing.totalAmount,
      currency: orderResult.currency,
      keyId: orderResult.keyId,
      planName: plan.name,
      planSlug: plan.slug,
      billingCycle: selectedCycle,
      isMock: !this.paymentGateway.isConfigured() || orderResult.orderId.startsWith("order_mock_"),
    };
  }
}
