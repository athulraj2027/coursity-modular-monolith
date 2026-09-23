import { SubscriptionRepository } from "../../domain/repositories/subscription.repository";
import { PlanRepository } from "@/modules/plan/domain/repositories/plan.repository";
import { IPaymentGateway } from "@/infrastructure/payment";
import { IEmailService } from "@/infrastructure/email";
import { IOfferRepository } from "@/modules/offer/domain/repositories/offer.repository";
import { GetPlanOfferUseCase } from "@/modules/offer/application/use-cases/get-plan-offer.usecase";
import { VerifyRazorpayPaymentDto } from "../../domain/dtos/subscription.dto";
import { calculatePlanCheckoutPrice, DEFAULT_GST_PERCENT } from "../../domain/constants/billing.constants";
import { TeacherSubscription, SubscriptionInvoice } from "../../domain/entities/subscription.entity";
import { BadRequestError, NotFoundError } from "@/app/errors";
import defaultPrisma from "@/infrastructure/database/prisma.client";

export class VerifyRazorpayPaymentUseCase {
  constructor(
    private readonly subscriptionRepo: SubscriptionRepository,
    private readonly planRepo: PlanRepository,
    private readonly paymentGateway: IPaymentGateway,
    private readonly emailService: IEmailService,
    private readonly offerRepo?: IOfferRepository,
    private readonly getPlanOfferUseCase?: GetPlanOfferUseCase
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

    // 3. Compute Dates & Pricing (with dynamic GST and Default Offer Discount)
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

    let finalBasePrice: number;
    let finalTaxAmount: number;
    let finalAmount: number;
    let appliedOfferId: string | null = null;
    let appliedDiscountAmount = 0;

    if (this.getPlanOfferUseCase) {
      try {
        const planOffer = await this.getPlanOfferUseCase.execute({
          planId: plan.id,
          billingCycle: selectedCycle,
          teacherProfileId: dto.teacherProfileId,
          offerId: dto.offerId,
        });

        if (planOffer.hasOffer && planOffer.offerId) {
          finalBasePrice = planOffer.discountedBasePrice;
          finalTaxAmount = planOffer.taxAmount;
          finalAmount = planOffer.totalAmount;
          appliedOfferId = planOffer.offerId;
          appliedDiscountAmount = planOffer.discountAmount;
        } else {
          const standardPricing = calculatePlanCheckoutPrice(Number(plan.price), selectedCycle, DEFAULT_GST_PERCENT);
          finalBasePrice = standardPricing.basePrice;
          finalTaxAmount = standardPricing.taxAmount;
          finalAmount = standardPricing.totalAmount;
        }
      } catch {
        const standardPricing = calculatePlanCheckoutPrice(Number(plan.price), selectedCycle, DEFAULT_GST_PERCENT);
        finalBasePrice = standardPricing.basePrice;
        finalTaxAmount = standardPricing.taxAmount;
        finalAmount = standardPricing.totalAmount;
      }
    } else {
      const standardPricing = calculatePlanCheckoutPrice(Number(plan.price), selectedCycle, DEFAULT_GST_PERCENT);
      finalBasePrice = standardPricing.basePrice;
      finalTaxAmount = standardPricing.taxAmount;
      finalAmount = standardPricing.totalAmount;
    }

    // 4. Resolve Teacher/User Details for Invoice
    let teacherName = dto.userName || "Instructor";
    let teacherEmail = dto.userEmail || "";
    let teacherPhone = dto.phone || null;
    let teacherCountry = dto.country || "India";
    let teacherState = dto.state || null;

    try {
      const teacherProfile = await defaultPrisma.teacherProfile.findUnique({
        where: { id: dto.teacherProfileId },
        include: {
          profile: {
            include: { user: true },
          },
        },
      });

      if (teacherProfile?.profile?.user) {
        if (!teacherName || teacherName === "Instructor") {
          teacherName = teacherProfile.profile.user.name || teacherName;
        }
        if (!teacherEmail) {
          teacherEmail = teacherProfile.profile.user.email || teacherEmail;
        }
        if (!teacherPhone) {
          teacherPhone = teacherProfile.profile.phone || teacherPhone;
        }
        if (!teacherCountry) {
          teacherCountry = teacherProfile.profile.country || teacherCountry;
        }
      }
    } catch (profileErr) {
      console.warn("⚠️ [Invoice User Resolution] Non-fatal error reading teacher profile:", profileErr);
    }

    // 5. Update or Create Active Subscription
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
        externalCustomerId: teacherEmail,
        externalSubscriptionId: dto.paymentId,
      });
    }

    // 6. Generate Subscription Invoice with Full Plan & User Metadata
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
        planName: plan.name,
        billingCycle: selectedCycle,
        baseAmount: finalBasePrice,
        taxAmount: finalTaxAmount,
        taxPercent: DEFAULT_GST_PERCENT,
        offerId: appliedOfferId,
        discountAmount: appliedDiscountAmount,
        userName: teacherName,
        userEmail: teacherEmail,
        userPhone: teacherPhone,
        userState: teacherState,
        userCountry: teacherCountry,
        gstin: dto.gstin || null,
        gatewayOrderId: dto.orderId,
        gatewayPaymentId: dto.paymentId,
      },
    });

    // 7. Record Offer Redemption in audit table if an offer was applied
    if (appliedOfferId && this.offerRepo) {
      try {
        await this.offerRepo.recordRedemption({
          offerId: appliedOfferId,
          teacherProfileId: dto.teacherProfileId,
          subscriptionId: subscription.id,
          invoiceId: invoiceRecord.id,
          discountAmount: appliedDiscountAmount,
          finalPaidAmount: finalAmount,
        });
      } catch (redemptionErr) {
        console.warn("⚠️ [Offer Redemption] Non-fatal error recording redemption audit:", redemptionErr);
      }
    }

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
      planName: invoiceRecord.planName,
      billingCycle: invoiceRecord.billingCycle,
      baseAmount: invoiceRecord.baseAmount ? Number(invoiceRecord.baseAmount) : finalBasePrice,
      taxAmount: invoiceRecord.taxAmount ? Number(invoiceRecord.taxAmount) : finalTaxAmount,
      taxPercent: invoiceRecord.taxPercent ? Number(invoiceRecord.taxPercent) : DEFAULT_GST_PERCENT,
      userName: invoiceRecord.userName,
      userEmail: invoiceRecord.userEmail,
      userPhone: invoiceRecord.userPhone,
      userState: invoiceRecord.userState,
      userCountry: invoiceRecord.userCountry,
      gstin: invoiceRecord.gstin,
      gatewayOrderId: invoiceRecord.gatewayOrderId,
      gatewayPaymentId: invoiceRecord.gatewayPaymentId,
      createdAt: invoiceRecord.createdAt,
      updatedAt: invoiceRecord.updatedAt,
    };

    // 8. Dispatch Transactional Confirmation Email (Asynchronous queue)
    this.emailService
      .sendSubscriptionPurchasedNotification({
        email: teacherEmail,
        teacherName: teacherName || "Instructor",
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
