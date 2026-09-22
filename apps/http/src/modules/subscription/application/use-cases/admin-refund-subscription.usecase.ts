import { SubscriptionRepository } from "../../domain/repositories/subscription.repository";
import { IPaymentGateway } from "@/infrastructure/payment";
import { IEmailService } from "@/infrastructure/email";
import { AdminRefundSubscriptionDto } from "../../domain/dtos/subscription.dto";
import { BadRequestError, NotFoundError } from "@/app/errors";
import defaultPrisma from "@/infrastructure/database/prisma.client";

export class AdminRefundSubscriptionUseCase {
  constructor(
    private readonly subscriptionRepo: SubscriptionRepository,
    private readonly paymentGateway: IPaymentGateway,
    private readonly emailService: IEmailService
  ) {}

  async execute(dto: AdminRefundSubscriptionDto): Promise<{
    refundId: string;
    invoiceId: string;
    amount: number;
    currency: string;
    status: string;
    subscriptionStatus: string;
  }> {
    // 1. Fetch Subscription & Invoice
    const subscription = await this.subscriptionRepo.findById(dto.subscriptionId);
    if (!subscription) {
      throw new NotFoundError(`Subscription with ID '${dto.subscriptionId}' not found.`);
    }

    const invoice = await defaultPrisma.subscriptionInvoice.findUnique({
      where: { id: dto.invoiceId },
      include: {
        subscription: {
          include: {
            teacherProfile: {
              include: {
                profile: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundError(`Invoice with ID '${dto.invoiceId}' not found.`);
    }

    if (invoice.subscriptionId !== dto.subscriptionId) {
      throw new BadRequestError(`Invoice '${dto.invoiceId}' does not belong to subscription '${dto.subscriptionId}'.`);
    }

    if (invoice.status === "REFUNDED") {
      throw new BadRequestError(`Invoice '${invoice.invoiceNumber}' has already been refunded.`);
    }

    const maxAmount = Number(invoice.amount);
    const refundAmount = dto.amount ? Number(dto.amount) : maxAmount;

    if (refundAmount <= 0 || refundAmount > maxAmount) {
      throw new BadRequestError(`Refund amount must be between ₹1 and the original paid amount (₹${maxAmount}).`);
    }

    // 2. Identify Payment ID (from invoice gatewayPaymentId or subscription externalSubscriptionId)
    const paymentId = invoice.gatewayPaymentId || subscription.externalSubscriptionId || "";

    // 3. Process Refund via Payment Gateway
    const refundResult = await this.paymentGateway.refundPayment({
      paymentId,
      amount: refundAmount,
      currency: invoice.currency || "INR",
      notes: {
        subscriptionId: dto.subscriptionId,
        invoiceId: dto.invoiceId,
        invoiceNumber: invoice.invoiceNumber,
        reason: dto.reason,
      },
    });

    // 4. Update Invoice Status to REFUNDED
    await this.subscriptionRepo.adminUpdateInvoiceStatus(dto.invoiceId, "REFUNDED");

    // 5. Handle Optional Immediate Subscription Cancellation
    let updatedSubscriptionStatus = subscription.status;
    if (dto.cancelSubscriptionImmediately) {
      const canceledSub = await this.subscriptionRepo.updateStatus(
        dto.subscriptionId,
        "CANCELED",
        new Date()
      );
      updatedSubscriptionStatus = canceledSub.status;
    }

    // 6. Send Refund Confirmation Email
    const user = invoice.subscription?.teacherProfile?.profile?.user;
    if (user?.email) {
      this.emailService
        .sendCustomEmail({
          to: user.email,
          subject: `Payment Refund Issued: Invoice #${invoice.invoiceNumber}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #111;">
              <h2>Refund Processed Successfully</h2>
              <p>Hi ${user.name || "Instructor"},</p>
              <p>We have processed a refund of <strong>₹${refundAmount.toFixed(2)}</strong> for Invoice <strong>#${invoice.invoiceNumber}</strong>.</p>
              <p><strong>Reason:</strong> ${dto.reason}</p>
              <p><strong>Refund Reference:</strong> ${refundResult.refundId}</p>
              <p>Depending on your payment provider / bank, funds typically reflect in your account within 5-7 business days.</p>
              <p>Best regards,<br/>The Coursity Team</p>
            </div>
          `,
          text: `Refund Processed for Invoice #${invoice.invoiceNumber}. Amount: ₹${refundAmount.toFixed(2)}. Reason: ${dto.reason}. Refund ID: ${refundResult.refundId}`,
        })
        .catch((e) => console.warn("⚠️ Failed to dispatch refund confirmation email:", e));
    }

    return {
      refundId: refundResult.refundId,
      invoiceId: dto.invoiceId,
      amount: refundResult.amount,
      currency: refundResult.currency,
      status: refundResult.status,
      subscriptionStatus: updatedSubscriptionStatus,
    };
  }
}
