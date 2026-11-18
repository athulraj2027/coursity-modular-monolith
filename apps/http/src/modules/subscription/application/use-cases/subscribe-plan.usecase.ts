import { ISubscriptionRepository, IInvoiceRepository } from "../../domain/repositories/subscription.repository";
import { IPlanRepository } from "@/modules/plan/domain/repositories/plan.repository";
import { TeacherSubscription } from "../../domain/entities/subscription.entity";
import { SubscribePlanDto } from "../../domain/dtos/subscription.dto";
import { SubscriptionNotFoundError } from "../../domain/errors/subscription.errors";
import { SubscriptionPlanPolicy, SubscriptionPeriodPolicy } from "../../domain/policies";

export class SubscribePlanUseCase {
  constructor(
    private readonly subscriptionRepo: ISubscriptionRepository & IInvoiceRepository,
    private readonly planRepo: IPlanRepository
  ) {}

  async execute(dto: SubscribePlanDto): Promise<TeacherSubscription> {
    const targetPlan = await this.planRepo.findById(dto.planId);
    if (!targetPlan) {
      throw new SubscriptionNotFoundError(`Plan with id '${dto.planId}' not found.`);
    }

    const activeSub = await this.subscriptionRepo.findActiveByTeacherId(dto.teacherProfileId);
    let currentPlan = activeSub?.plan;
    if (activeSub && !currentPlan && activeSub.planId) {
      currentPlan = (await this.planRepo.findById(activeSub.planId)) || undefined;
    }

    SubscriptionPlanPolicy.assertCanSubscribe(targetPlan, currentPlan, activeSub?.status);

    const now = new Date();
    const periodEnd = SubscriptionPeriodPolicy.calculatePeriodEnd(now, targetPlan.billingCycle);

    let trialEndsAt: Date | null = null;
    if (!activeSub || activeSub.status !== "ACTIVE") {
      trialEndsAt = SubscriptionPeriodPolicy.calculateTrialEnd(now, targetPlan.trialDays);
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
        const teacherProfile = await this.subscriptionRepo.findTeacherWithUser(dto.teacherProfileId);

        const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`;
        await this.subscriptionRepo.createInvoice({
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
        });
      } catch (e) {
        console.warn("⚠️ [Subscribe Plan] Non-fatal error creating free activation invoice:", e);
      }
    }

    return subscription;
  }
}
