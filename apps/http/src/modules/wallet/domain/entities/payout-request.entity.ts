export type PayoutStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "REJECTED"
  | "FAILED";

export interface PayoutRequestEntity {
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
  processedAt?: Date | null;
  rejectionReason?: string | null;
  transactionRef?: string | null;
  createdAt: Date;
  updatedAt: Date;
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
