import { PayoutStatus } from "../entities/payout-request.entity";

export interface RequestPayoutDto {
  userId: string;
  amount: number;
  bankDetailId?: string; // Optional: If omitted, uses primary bank
}

export interface AdminProcessPayoutDto {
  id: string;
  status: "COMPLETED" | "REJECTED" | "PROCESSING";
  processedByUserId: string;
  rejectionReason?: string;
  transactionRef?: string; // Bank UTR or payment transfer reference
}

export interface ListPayoutsQueryDto {
  userId?: string;
  status?: PayoutStatus;
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
}
