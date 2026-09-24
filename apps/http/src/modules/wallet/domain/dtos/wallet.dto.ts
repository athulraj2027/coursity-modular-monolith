import { WalletStatus } from "../entities/wallet.entity";

export interface CreateTopUpOrderDto {
  userId: string;
  amount: number; // in INR
}

export interface VerifyTopUpPaymentDto {
  userId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface AdminWalletAdjustmentDto {
  userId: string;
  amount: number;
  direction: "CREDIT" | "DEBIT";
  reason: string;
  performedByUserId: string;
}

export interface AdminListWalletsQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: WalletStatus;
}
