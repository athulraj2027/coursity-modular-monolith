import { SubscriptionInvoice } from "../../domain/entities/subscription.entity";
import defaultPrisma from "@/infrastructure/database/prisma.client";

export class GetInvoicesUseCase {
  async execute(teacherProfileId: string): Promise<SubscriptionInvoice[]> {
    const invoices = await defaultPrisma.subscriptionInvoice.findMany({
      where: {
        subscription: {
          teacherProfileId,
        },
      },
      include: {
        subscription: {
          include: {
            plan: true,
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
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    return invoices.map((inv) => {
      const amount = Number(inv.amount);
      const subPlan = inv.subscription?.plan;
      const subUser = inv.subscription?.teacherProfile?.profile?.user;
      const subProfile = inv.subscription?.teacherProfile?.profile;

      const baseAmount =
        inv.baseAmount !== null && inv.baseAmount !== undefined
          ? Number(inv.baseAmount)
          : Math.round((amount / 1.18) * 100) / 100;

      const taxAmount =
        inv.taxAmount !== null && inv.taxAmount !== undefined
          ? Number(inv.taxAmount)
          : Math.round((amount - baseAmount) * 100) / 100;

      const taxPercent =
        inv.taxPercent !== null && inv.taxPercent !== undefined
          ? Number(inv.taxPercent)
          : 18;

      return {
        id: inv.id,
        subscriptionId: inv.subscriptionId,
        invoiceNumber: inv.invoiceNumber,
        amount,
        currency: inv.currency,
        status: inv.status as any,
        paymentMethod: inv.paymentMethod,
        receiptUrl: inv.receiptUrl,
        paidAt: inv.paidAt,
        planName: inv.planName || subPlan?.name || "Instructor Plan",
        billingCycle: inv.billingCycle || subPlan?.billingCycle || "MONTHLY",
        baseAmount,
        taxAmount,
        taxPercent,
        userName: inv.userName || subUser?.name || "Instructor",
        userEmail: inv.userEmail || subUser?.email || "",
        userPhone: inv.userPhone || subProfile?.phone || null,
        userAddress: inv.userAddress || null,
        userState: inv.userState || null,
        userCountry: inv.userCountry || subProfile?.country || "India",
        gstin: inv.gstin || null,
        gatewayOrderId: inv.gatewayOrderId || null,
        gatewayPaymentId: inv.gatewayPaymentId || null,
        createdAt: inv.createdAt,
        updatedAt: inv.updatedAt,
      };
    });
  }
}
