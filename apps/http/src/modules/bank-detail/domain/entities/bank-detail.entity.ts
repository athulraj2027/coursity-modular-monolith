export type BankAccountType = "SAVINGS" | "CURRENT";
export type BankVerificationStatus = "PENDING" | "VERIFIED" | "REJECTED" | "FAILED";
export type PayoutMethodType = "BANK_ACCOUNT" | "UPI";

export interface BankDetailEntityProps {
  id: string;
  userId: string;
  methodType?: PayoutMethodType;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName?: string | null;
  accountType?: BankAccountType;
  upiId?: string | null;
  isPrimary?: boolean;
  isVerified?: boolean;
  verificationStatus?: BankVerificationStatus;
  rejectionReason?: string | null;
  verificationNotes?: string | null;
  verifiedAt?: Date | null;
  
  // Vendor-agnostic payout references (Clean Architecture)
  payoutAccountId?: string | null;
  payoutContactId?: string | null;

  // Backward-compatibility aliases for existing Razorpay-specific references
  razorpayFundAccountId?: string | null;
  razorpayContactId?: string | null;

  createdAt?: Date;
  updatedAt?: Date;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export class BankDetailEntity {
  public id: string;
  public userId: string;
  public methodType: PayoutMethodType;
  public accountHolderName: string;
  public accountNumber: string;
  public ifscCode: string;
  public bankName: string;
  public branchName?: string | null;
  public accountType: BankAccountType;
  public upiId?: string | null;
  public isPrimary: boolean;
  public isVerified: boolean;
  public verificationStatus: BankVerificationStatus;
  public rejectionReason?: string | null;
  public verificationNotes?: string | null;
  public verifiedAt?: Date | null;
  public payoutAccountId?: string | null;
  public payoutContactId?: string | null;
  public createdAt: Date;
  public updatedAt: Date;
  public user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };

  constructor(props: BankDetailEntityProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.methodType = props.methodType ?? "BANK_ACCOUNT";
    this.accountHolderName = props.accountHolderName;
    this.accountNumber = props.accountNumber;
    this.ifscCode = props.ifscCode;
    this.bankName = props.bankName;
    this.branchName = props.branchName ?? null;
    this.accountType = props.accountType ?? "SAVINGS";
    this.upiId = props.upiId ?? null;
    this.isPrimary = props.isPrimary ?? false;
    this.isVerified = props.isVerified ?? (props.verificationStatus === "VERIFIED");
    this.verificationStatus = props.verificationStatus ?? (props.isVerified ? "VERIFIED" : "PENDING");
    this.rejectionReason = props.rejectionReason ?? null;
    this.verificationNotes = props.verificationNotes ?? props.rejectionReason ?? null;
    this.verifiedAt = props.verifiedAt ?? null;
    this.payoutAccountId = props.payoutAccountId ?? props.razorpayFundAccountId ?? null;
    this.payoutContactId = props.payoutContactId ?? props.razorpayContactId ?? null;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
    this.user = props.user;
  }

  get razorpayFundAccountId(): string | null | undefined {
    return this.payoutAccountId;
  }

  get razorpayContactId(): string | null | undefined {
    return this.payoutContactId;
  }
}
