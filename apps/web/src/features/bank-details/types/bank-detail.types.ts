export type BankAccountType = "SAVINGS" | "CURRENT";
export type BankVerificationStatus = "PENDING" | "VERIFIED" | "REJECTED" | "FAILED";
export type PayoutMethodType = "BANK_ACCOUNT" | "UPI";

export interface BankDetail {
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
  verifiedAt?: string | null;
  razorpayFundAccountId?: string | null;
  razorpayContactId?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface CreateBankDetailPayload {
  methodType: PayoutMethodType;
  accountHolderName: string;
  accountNumber?: string;
  ifscCode?: string;
  bankName?: string;
  branchName?: string;
  accountType?: BankAccountType;
  upiId?: string;
  isPrimary?: boolean;
}

export interface UpdateBankVerificationPayload {
  status: BankVerificationStatus;
  notes?: string;
}

export interface AdminBankDetailsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: BankVerificationStatus;
  methodType?: PayoutMethodType;
  userId?: string;
}

export interface PaginatedBankDetailsResponse {
  items: BankDetail[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
