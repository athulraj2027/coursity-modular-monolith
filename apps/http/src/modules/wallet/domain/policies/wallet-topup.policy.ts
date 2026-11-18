import { InvalidTopUpAmountError } from "../errors/wallet.errors";

export class WalletTopUpPolicy {
  public static readonly MIN_TOPUP_AMOUNT = 10;
  public static readonly MAX_TOPUP_AMOUNT = 100000;
  public static readonly DEFAULT_FALLBACK_DEPOSIT_AMOUNT = 500;

  public static validateTopUpAmount(amount: number): void {
    if (amount < this.MIN_TOPUP_AMOUNT) {
      throw new InvalidTopUpAmountError(
        `Minimum wallet top-up amount is ₹${this.MIN_TOPUP_AMOUNT}`
      );
    }
    if (amount > this.MAX_TOPUP_AMOUNT) {
      throw new InvalidTopUpAmountError(
        `Maximum single top-up amount is ₹${this.MAX_TOPUP_AMOUNT.toLocaleString("en-IN")}`
      );
    }
  }

  public static generateTopUpReceipt(userId: string, timestamp = Date.now()): string {
    const userSlice = userId.slice(0, 8);
    return `topup_${userSlice}_${timestamp}`;
  }
}
