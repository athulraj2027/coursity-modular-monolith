import { BankAccountType, BankVerificationStatus, PayoutMethodType } from "../entities/bank-detail.entity";

export interface CreateBankDetailDto {
  userId: string;
  methodType?: PayoutMethodType;
  accountHolderName: string;
  accountNumber?: string;
  ifscCode?: string;
  bankName?: string;
  branchName?: string;
  accountType?: BankAccountType;
  upiId?: string;
  isPrimary?: boolean;
  isVerified?: boolean;
  verificationStatus?: BankVerificationStatus;
}

export interface UpdateBankDetailDto {
  accountHolderName?: string;
  accountNumber?: string;
  ifscCode?: string;
  bankName?: string;
  branchName?: string;
  accountType?: BankAccountType;
  upiId?: string;
  isPrimary?: boolean;
  isVerified?: boolean;
  verificationStatus?: BankVerificationStatus;
  verificationNotes?: string;
  rejectionReason?: string;
  verifiedAt?: Date;
  payoutAccountId?: string;
  payoutContactId?: string;
}

export interface UpdateBankVerificationDto {
  id: string;
  status?: BankVerificationStatus;
  verificationStatus?: BankVerificationStatus;
  isVerified?: boolean;
  notes?: string;
  rejectionReason?: string;
}

export interface AdminBankDetailsQueryDto {
  page?: number;
  limit?: number;
  skip?: number;
  take?: number;
  search?: string;
  status?: BankVerificationStatus;
  verificationStatus?: BankVerificationStatus;
  methodType?: PayoutMethodType;
  userId?: string;
  isVerified?: boolean;
}
