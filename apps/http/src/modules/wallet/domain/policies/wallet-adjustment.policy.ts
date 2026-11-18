import { WalletAdjustmentReasonRequiredError } from "../errors/wallet.errors";

export class WalletAdjustmentPolicy {
  public static readonly MIN_REASON_LENGTH = 5;

  public static validateReason(reason?: string | null): void {
    if (!reason || reason.trim().length < this.MIN_REASON_LENGTH) {
      throw new WalletAdjustmentReasonRequiredError(
        `A descriptive reason (min ${this.MIN_REASON_LENGTH} chars) is required for admin wallet adjustments`
      );
    }
  }

  public static formatAdjustmentDescription(direction: "CREDIT" | "DEBIT", reason: string): string {
    const trimmed = reason.trim();
    return direction === "CREDIT"
      ? `Admin balance adjustment: ${trimmed}`
      : `Admin balance deduction: ${trimmed}`;
  }
}
