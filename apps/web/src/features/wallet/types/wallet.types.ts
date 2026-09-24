export type WalletStatus = "ACTIVE" | "FROZEN" | "SUSPENDED";

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

export type PayoutStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "REJECTED"
  | "FAILED";

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  lockedBalance: number;
  availableBalance: number;
  currency: string;
  status: WalletStatus;
  totalEarned: number;
  totalSpent: number;
  totalWithdrawn: number;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
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
  createdAt: string;
  updatedAt: string;
}

export interface PayoutRequest {
  id: string;
  walletId: string;
  userId: string;
  bankDetailId: string;
  amount: number;
  currency: string;
  status: PayoutStatus;
  payoutMethod: "BANK_ACCOUNT" | "UPI";
  accountSummary: string;
  processedByUserId?: string | null;
  processedAt?: string | null;
  rejectionReason?: string | null;
  transactionRef?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  bankDetail?: {
    id: string;
    methodType: string;
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    branchName?: string | null;
    accountType: string;
    upiId?: string | null;
  } | null;
}

export interface TopUpOrderResult {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  receipt?: string;
  notes?: Record<string, any>;
}

export interface VerifyTopUpPayload {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface RequestPayoutPayload {
  amount: number;
  bankDetailId?: string;
}

export interface AdminProcessPayoutPayload {
  status: "COMPLETED" | "REJECTED" | "PROCESSING";
  rejectionReason?: string;
  transactionRef?: string;
}

export interface AdminWalletAdjustmentPayload {
  userId: string;
  amount: number;
  direction: "CREDIT" | "DEBIT";
  reason: string;
}

export interface TransactionsQuery {
  page?: number;
  limit?: number;
  type?: TransactionType;
  direction?: TransactionDirection;
  status?: TransactionStatus;
  startDate?: string;
  endDate?: string;
}

export interface PayoutsQuery {
  page?: number;
  limit?: number;
  status?: PayoutStatus;
  search?: string;
  userId?: string;
}

export interface AdminWalletsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: WalletStatus;
}

export interface PaginatedTransactionsResponse {
  items: WalletTransaction[];
  total: number;
}

export interface PaginatedPayoutsResponse {
  items: PayoutRequest[];
  total: number;
  stats?: {
    pendingAmount: number;
    pendingCount: number;
    completedAmount: number;
    completedCount: number;
  };
}

export interface AdminWalletItem extends Wallet {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface PaginatedWalletsResponse {
  items: AdminWalletItem[];
  total: number;
  stats?: {
    totalPlatformBalance: number;
    totalLockedBalance: number;
    totalLifetimeEarned: number;
    totalLifetimeWithdrawn: number;
  };
}

