import { PlanRepository } from "../../domain/repositories/plan.repository";
import { IPaymentGateway } from "@/infrastructure/payment";
import { CreateRazorpayOrderDto, RazorpayOrderResponseDto } from "../../domain/dtos/plan.dto";
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

    // Determine billing cycle & final amount (DB price is stored in paise: 349900 = ₹3,499.00)
    const basePriceInRupees = plan.price >= 100 ? Number(plan.price) / 100 : Number(plan.price);
    const selectedCycle = dto.billingCycle || plan.billingCycle || "MONTHLY";
    let finalAmountInRupees = basePriceInRupees;

    if (selectedCycle === "YEARLY") {
      finalAmountInRupees = basePriceInRupees * 10; // 10x monthly price for annual tier (2 months free)
    } else if (selectedCycle === "QUARTERLY") {
      finalAmountInRupees = basePriceInRupees * 2.7; // ~10% discount for quarterly
    }

    const receipt = `rcpt_${dto.teacherProfileId.substring(0, 8)}_${Date.now().toString().slice(-6)}`;

    const orderResult = await this.paymentGateway.createOrder({
      amount: finalAmountInRupees,
      currency: "INR",
      receipt,
      notes: {
        teacherProfileId: dto.teacherProfileId,
        planId: plan.id,
        planName: plan.name,
        billingCycle: selectedCycle,
        userEmail: dto.userEmail,
        userName: dto.userName,
        phone: dto.phone || "",
        state: dto.state || "",
        gstin: dto.gstin || "",
      },
    });

    return {
      orderId: orderResult.orderId,
      amount: finalAmountInRupees,
      currency: orderResult.currency,
      keyId: orderResult.keyId,
      planName: plan.name,
      planSlug: plan.slug,
      billingCycle: selectedCycle,
      isMock: !this.paymentGateway.isConfigured() || orderResult.orderId.startsWith("order_mock_"),
    };
  }
}
