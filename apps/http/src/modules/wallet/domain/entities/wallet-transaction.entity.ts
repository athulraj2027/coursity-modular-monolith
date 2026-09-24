export type TransactionType =
  | "DEPOSIT"
  | "ENROLLMENT_PAYMENT"
  | "EARNING"
  | "REFUND"
  | "PAYOUT_WITHDRAWAL"
  | "ADJUSTMENT"
  | "CASHBACK_BONUS";

export type TransactionDirection = "CREDIT" | "DEBIT";

export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED" | "REVERSED";

export interface WalletTransactionEntity {
  id: string;
  walletId: string;
  type: TransactionType;
  direction: TransactionDirection;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  currency: string;
  status: TransactionStatus;
  description: string;
  referenceType?: string | null;
  referenceId?: string | null;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  performedByUserId?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
