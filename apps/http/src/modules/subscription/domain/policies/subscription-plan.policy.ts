import {
  SubscriptionPlanInactiveError,
  SubscriptionAlreadySubscribedError,
  SubscriptionDowngradeNotAllowedError,
} from "../errors/subscription.errors";

export interface PlanLike {
  id: string;
  name: string;
  isActive: boolean;
  price: number;
}

export class SubscriptionPlanPolicy {
  /**
   * Asserts that a teacher can subscribe to the target plan given their current plan and status.
   * Throws domain errors if the plan is inactive, identical to active plan, or a downgrade attempt.
   */
  static assertCanSubscribe(
    targetPlan: PlanLike,
    currentPlan?: PlanLike | null,
    currentStatus?: string | null
  ): void {
    if (!targetPlan.isActive) {
      throw new SubscriptionPlanInactiveError(
        `Plan '${targetPlan.name}' is currently not active for new subscriptions.`
      );
    }

    if (currentStatus === "ACTIVE" && currentPlan) {
      if (currentPlan.id === targetPlan.id) {
        throw new SubscriptionAlreadySubscribedError(
          `You are already subscribed to the '${targetPlan.name}' plan.`
        );
      }

      if (currentPlan.price > 0 && targetPlan.price < currentPlan.price) {
        throw new SubscriptionDowngradeNotAllowedError(
          `Cannot downgrade active '${currentPlan.name}' plan to a lower tier with reduced quotas.`
        );
      }
    }
  }
}
