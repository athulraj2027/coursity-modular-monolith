import { SubscriptionInvoice } from "../../domain/entities/plan.entity";
import defaultPrisma from "@/infrastructure/database/prisma.client";

export class GetInvoicesUseCase {
  async execute(teacherProfileId: string): Promise<SubscriptionInvoice[]> {
    const invoices = await defaultPrisma.subscriptionInvoice.findMany({
      where: {
        subscription: {
          teacherProfileId,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    return invoices.map((inv) => ({
      id: inv.id,
      subscriptionId: inv.subscriptionId,
      invoiceNumber: inv.invoiceNumber,
      amount: Number(inv.amount),
      currency: inv.currency,
      status: inv.status as any,
      paymentMethod: inv.paymentMethod,
      receiptUrl: inv.receiptUrl,
      paidAt: inv.paidAt,
      createdAt: inv.createdAt,
      updatedAt: inv.updatedAt,
    }));
  }
}
