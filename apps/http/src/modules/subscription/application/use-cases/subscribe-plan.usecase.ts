import { SubscriptionRepository } from "../../domain/repositories/subscription.repository";
import { PlanRepository } from "@/modules/plan/domain/repositories/plan.repository";
import { TeacherSubscription } from "../../domain/entities/subscription.entity";
import { SubscribePlanDto } from "../../domain/dtos/subscription.dto";
import defaultPrisma from "@/infrastructure/database/prisma.client";

export class SubscribePlanUseCase {
  constructor(
    private readonly subscriptionRepo: SubscriptionRepository,
    private readonly planRepo: PlanRepository
  ) {}

  async execute(dto: SubscribePlanDto): Promise<TeacherSubscription> {
    const targetPlan = await this.planRepo.findById(dto.planId);
    if (!targetPlan) {
      throw new Error(`Plan with id '${dto.planId}' not found.`);
    }

    if (!targetPlan.isActive) {
      throw new Error(`Plan '${targetPlan.name}' is currently not active for new subscriptions.`);
    }

    const activeSub = await this.subscriptionRepo.findActiveByTeacherId(dto.teacherProfileId);

    const now = new Date();
    const periodEnd = new Date(now);

    if (targetPlan.billingCycle === "YEARLY") {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else if (targetPlan.billingCycle === "QUARTERLY") {
      periodEnd.setMonth(periodEnd.getMonth() + 3);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    let trialEndsAt: Date | null = null;
    if (targetPlan.trialDays > 0 && (!activeSub || activeSub.status !== "ACTIVE")) {
      trialEndsAt = new Date(now);
      trialEndsAt.setDate(trialEndsAt.getDate() + targetPlan.trialDays);
    }

    let subscription: TeacherSubscription;

    if (activeSub) {
      subscription = await this.subscriptionRepo.changePlan(
        activeSub.id,
        targetPlan.id,
        now,
        periodEnd
      );
    } else {
      subscription = await this.subscriptionRepo.create({
        teacherProfileId: dto.teacherProfileId,
        planId: targetPlan.id,
        status: "ACTIVE",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        trialEndsAt,
        externalCustomerId: dto.externalCustomerId,
        externalSubscriptionId: dto.externalSubscriptionId,
      });
    }

    // If free plan, record ₹0 initial activation invoice
    if (targetPlan.price === 0) {
      try {
        const teacherProfile = await defaultPrisma.teacherProfile.findUnique({
          where: { id: dto.teacherProfileId },
          include: { profile: { include: { user: true } } },
        });

        const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`;
        await defaultPrisma.subscriptionInvoice.create({
          data: {
            subscriptionId: subscription.id,
            invoiceNumber,
            amount: 0,
            currency: "INR",
            status: "PAID",
            paymentMethod: "FREE_ACTIVATION",
            paidAt: now,
            planName: targetPlan.name,
            billingCycle: targetPlan.billingCycle,
            baseAmount: 0,
            taxAmount: 0,
            taxPercent: 0,
            userName: teacherProfile?.profile?.user?.name || "Instructor",
            userEmail: teacherProfile?.profile?.user?.email || "",
            userPhone: teacherProfile?.profile?.phone || null,
            userCountry: teacherProfile?.profile?.country || "India",
          },
        });
      } catch (e) {
        console.warn("⚠️ [Subscribe Plan] Non-fatal error creating free activation invoice:", e);
      }
    }

    return subscription;
  }
}
