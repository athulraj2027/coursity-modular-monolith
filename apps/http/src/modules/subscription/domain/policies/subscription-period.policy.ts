import { BillingCycle } from "../entities/subscription.entity";

export class SubscriptionPeriodPolicy {
  /**
   * Calculates the subscription period end date based on the chosen billing cycle.
   */
  static calculatePeriodEnd(startDate: Date, billingCycle: BillingCycle = "MONTHLY"): Date {
    const end = new Date(startDate);

    switch (billingCycle) {
      case "YEARLY":
        end.setFullYear(end.getFullYear() + 1);
        break;
      case "QUARTERLY":
        end.setMonth(end.getMonth() + 3);
        break;
      case "LIFETIME":
        end.setFullYear(end.getFullYear() + 100);
        break;
      case "MONTHLY":
      default:
        end.setMonth(end.getMonth() + 1);
        break;
    }

    return end;
  }

  /**
   * Calculates the trial end date given trial days.
   */
  static calculateTrialEnd(startDate: Date, trialDays: number): Date | null {
    if (!trialDays || trialDays <= 0) return null;
    const trialEnd = new Date(startDate);
    trialEnd.setDate(trialEnd.getDate() + trialDays);
    return trialEnd;
  }

  /**
   * Extends the subscription period end date by a specified number of days or sets an explicit end date.
   */
  static calculateExtension(
    currentPeriodEnd: Date,
    daysToAdd?: number,
    explicitEndDate?: Date
  ): Date {
    if (explicitEndDate) {
      return new Date(explicitEndDate);
    }

    if (daysToAdd && daysToAdd > 0) {
      const now = new Date();
      const currentEnd = new Date(currentPeriodEnd);
      const baseDate = currentEnd > now ? currentEnd : now;
      return new Date(baseDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    }

    return new Date(currentPeriodEnd);
  }
}
