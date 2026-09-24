import { BankAccountType, BankVerificationStatus, PayoutMethodType } from "../entities/bank-detail.entity";

export interface CreateBankDetailDto {
  userId: string;
  methodType: PayoutMethodType;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName?: string;
  accountType?: BankAccountType;
  upiId?: string;
  isPrimary?: boolean;
}

export interface UpdateBankVerificationDto {
  id: string;
  status: BankVerificationStatus;
  notes?: string;
}

export interface AdminBankDetailsQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: BankVerificationStatus;
  methodType?: PayoutMethodType;
  userId?: string;
}
