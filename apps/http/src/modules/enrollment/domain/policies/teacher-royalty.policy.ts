export class TeacherRoyaltyPolicy {
  public static readonly DEFAULT_ROYALTY_RATE = 0.85; // 85% instructor earnings
  public static readonly PLATFORM_COMMISSION_RATE = 0.15; // 15% platform fee

  /**
   * Calculates teacher royalty earnings from the final paid enrollment amount.
   */
  public static calculateRoyalty(finalAmount: number, customRate = this.DEFAULT_ROYALTY_RATE): number {
    if (finalAmount <= 0) return 0;
    return Number((finalAmount * customRate).toFixed(2));
  }

  /**
   * Calculates platform commission amount.
   */
  public static calculatePlatformCommission(finalAmount: number, commissionRate = this.PLATFORM_COMMISSION_RATE): number {
    if (finalAmount <= 0) return 0;
    return Number((finalAmount * commissionRate).toFixed(2));
  }
}
