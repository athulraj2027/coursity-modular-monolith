import { SubscriptionRepository, PlanRepository } from "../../domain/repositories/plan.repository";
import { IPaymentGateway } from "@/infrastructure/payment";
import { IEmailService } from "@/infrastructure/email";
import { VerifyRazorpayPaymentDto } from "../../domain/dtos/plan.dto";
import { TeacherSubscription, SubscriptionInvoice } from "../../domain/entities/plan.entity";
import { BadRequestError, NotFoundError } from "@/app/errors";
import defaultPrisma from "@/infrastructure/database/prisma.client";

export class VerifyRazorpayPaymentUseCase {
  constructor(
    private readonly subscriptionRepo: SubscriptionRepository,
    private readonly planRepo: PlanRepository,
    private readonly paymentGateway: IPaymentGateway,
    private readonly emailService: IEmailService
  ) {}

  async execute(dto: VerifyRazorpayPaymentDto): Promise<{
    subscription: TeacherSubscription;
    invoice: SubscriptionInvoice;
  }> {
    // 1. Verify Payment Signature
    const isValid = this.paymentGateway.verifyPaymentSignature({
      orderId: dto.orderId,
      paymentId: dto.paymentId,
      signature: dto.signature,
    });

    if (!isValid) {
      throw new BadRequestError("Payment verification failed. Invalid cryptographic signature.");
    }

    // 2. Fetch Target Plan
    const plan = await this.planRepo.findById(dto.planId);
    if (!plan) {
      throw new NotFoundError(`Target plan with ID '${dto.planId}' not found.`);
    }

    // 3. Compute Dates
    const now = new Date();
    const periodEnd = new Date(now);
    const selectedCycle = dto.billingCycle || plan.billingCycle || "MONTHLY";

    if (selectedCycle === "YEARLY") {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else if (selectedCycle === "QUARTERLY") {
      periodEnd.setMonth(periodEnd.getMonth() + 3);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    const basePriceInRupees = plan.price >= 100 ? Number(plan.price) / 100 : Number(plan.price);
    let finalAmount = basePriceInRupees;
    if (selectedCycle === "YEARLY") {
      finalAmount = basePriceInRupees * 10;
    } else if (selectedCycle === "QUARTERLY") {
      finalAmount = basePriceInRupees * 2.7;
    }

    // 4. Update or Create Active Subscription
    const activeSub = await this.subscriptionRepo.findActiveByTeacherId(dto.teacherProfileId);
    let subscription: TeacherSubscription;

    if (activeSub) {
      subscription = await this.subscriptionRepo.changePlan(
        activeSub.id,
        plan.id,
        now,
        periodEnd
      );
    } else {
      subscription = await this.subscriptionRepo.create({
        teacherProfileId: dto.teacherProfileId,
        planId: plan.id,
        status: "ACTIVE",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        externalCustomerId: dto.userEmail,
        externalSubscriptionId: dto.paymentId,
      });
    }

    // 5. Generate Subscription Invoice
    const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`;
    const invoiceRecord = await defaultPrisma.subscriptionInvoice.create({
      data: {
        subscriptionId: subscription.id,
        invoiceNumber,
        amount: finalAmount,
        currency: "INR",
        status: "PAID",
        paymentMethod: "RAZORPAY",
        paidAt: now,
        receiptUrl: `https://dashboard.razorpay.com/app/payments/${dto.paymentId}`,
      },
    });

    const invoice: SubscriptionInvoice = {
      id: invoiceRecord.id,
      subscriptionId: invoiceRecord.subscriptionId,
      invoiceNumber: invoiceRecord.invoiceNumber,
      amount: Number(invoiceRecord.amount),
      currency: invoiceRecord.currency,
      status: invoiceRecord.status as any,
      paymentMethod: invoiceRecord.paymentMethod,
      receiptUrl: invoiceRecord.receiptUrl,
      paidAt: invoiceRecord.paidAt,
      createdAt: invoiceRecord.createdAt,
      updatedAt: invoiceRecord.updatedAt,
    };

    // 6. Dispatch Transactional Confirmation Email (Asynchronous queue)
    this.emailService
      .sendSubscriptionPurchasedNotification({
        email: dto.userEmail,
        teacherName: dto.userName || "Instructor",
        planName: plan.name,
        amount: finalAmount,
        currency: "INR",
        billingCycle: selectedCycle,
        currentPeriodEnd: periodEnd,
        invoiceNumber,
      })
      .catch((err) => {
        console.warn("⚠️ [Subscription Verification] Failed to enqueue purchase confirmation email:", err);
      });

    return {
      subscription,
      invoice,
    };
  }
}
