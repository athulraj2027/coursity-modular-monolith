import { OfferEligibility } from "../entities/offer.entity";

export class OfferEligibilityPolicy {
  /**
   * Checks whether the current time falls inside the offer's validity window
   */
  static isTimeValid(params: {
    now?: Date;
    validFrom: Date;
    validUntil?: Date | null;
  }): boolean {
    const now = params.now || new Date();
    const startTime = new Date(params.validFrom).getTime();

    if (now.getTime() < startTime) {
      return false;
    }

    if (params.validUntil) {
      const endTime = new Date(params.validUntil).getTime();
      if (now.getTime() > endTime) {
        return false;
      }
    }

    return true;
  }

  /**
   * Checks whether global redemption quota has remaining capacity
   */
  static hasGlobalCapacity(maxRedemptions: number | null, usedRedemptions: number): boolean {
    if (maxRedemptions === null || maxRedemptions === undefined) {
      return true;
    }
    return usedRedemptions < maxRedemptions;
  }

  /**
   * Checks whether an individual user has remaining redemptions
   */
  static hasUserCapacity(maxRedemptionsPerUser: number, userRedemptions: number): boolean {
    return userRedemptions < maxRedemptionsPerUser;
  }

  /**
   * Checks eligibility criteria for a teacher
   */
  static isTeacherEligible(
    eligibility: OfferEligibility,
    hasSubscribedBefore: boolean
  ): boolean {
    if (eligibility === "NEW_TEACHERS_ONLY") {
      return !hasSubscribedBefore;
    }
    return true;
  }
}
