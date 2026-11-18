import { PayoutStatus } from "../entities/payout-request.entity";
import {
  InvalidPayoutAmountError,
  InsufficientWalletBalanceError,
  InvalidPayoutStatusTransitionError,
} from "../errors/wallet.errors";

export const ALLOWED_PAYOUT_TRANSITIONS: Record<PayoutStatus, PayoutStatus[]> = {
  PENDING: ["PROCESSING", "COMPLETED", "REJECTED"],
  PROCESSING: ["COMPLETED", "REJECTED"],
  COMPLETED: [],
  REJECTED: [],
  FAILED: [],
};

export class WalletPayoutPolicy {
  public static readonly MIN_PAYOUT_AMOUNT = 500;
  public static readonly MAX_PAYOUT_AMOUNT = 1000000;

  public static validatePayoutAmount(amount: number): void {
    if (amount < this.MIN_PAYOUT_AMOUNT) {
      throw new InvalidPayoutAmountError(
        `Minimum withdrawal amount is ₹${this.MIN_PAYOUT_AMOUNT}`
      );
    }
    if (amount > this.MAX_PAYOUT_AMOUNT) {
      throw new InvalidPayoutAmountError(
        `Maximum single payout is ₹${this.MAX_PAYOUT_AMOUNT.toLocaleString("en-IN")}`
      );
    }
  }

  public static calculateAvailableBalance(balance: number, lockedBalance: number): number {
    return Math.max(0, balance - lockedBalance);
  }

  public static validateSufficientBalance(availableBalance: number, requestedAmount: number): void {
    if (availableBalance < requestedAmount) {
      throw new InsufficientWalletBalanceError(availableBalance, requestedAmount);
    }
  }

  public static formatAccountSummary(bankDetail: {
    methodType: string;
    upiId?: string | null;
    bankName?: string | null;
    accountNumber?: string | null;
  }): string {
    if (bankDetail.methodType === "UPI" && bankDetail.upiId) {
      return `UPI: ${bankDetail.upiId}`;
    }
    const bankName = bankDetail.bankName || "Bank";
    const last4 = bankDetail.accountNumber ? bankDetail.accountNumber.slice(-4) : "••••";
    return `${bankName} (A/C: ••••${last4})`;
  }

  public static validateStatusTransition(currentStatus: PayoutStatus, targetStatus: PayoutStatus): void {
    if (currentStatus === "COMPLETED" || currentStatus === "REJECTED") {
      throw new InvalidPayoutStatusTransitionError(
        `Payout request is already ${currentStatus.toLowerCase()}`
      );
    }

    const allowed = ALLOWED_PAYOUT_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(targetStatus)) {
      throw new InvalidPayoutStatusTransitionError(
        `Cannot transition payout request from ${currentStatus} to ${targetStatus}`
      );
    }
  }
}
