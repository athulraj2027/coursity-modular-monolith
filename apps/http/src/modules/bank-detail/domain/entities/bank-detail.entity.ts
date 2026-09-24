export type BankAccountType = "SAVINGS" | "CURRENT";
export type BankVerificationStatus = "PENDING" | "VERIFIED" | "REJECTED" | "FAILED";
export type PayoutMethodType = "BANK_ACCOUNT" | "UPI";

export interface BankDetailEntity {
  id: string;
  userId: string;
  methodType: PayoutMethodType;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName?: string | null;
  accountType: BankAccountType;
  upiId?: string | null;
  isPrimary: boolean;
  verificationStatus: BankVerificationStatus;
  verificationNotes?: string | null;
  verifiedAt?: Date | null;
  razorpayFundAccountId?: string | null;
  razorpayContactId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}
