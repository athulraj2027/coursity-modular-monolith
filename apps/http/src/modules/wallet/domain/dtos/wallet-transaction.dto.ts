import {
  TransactionDirection,
  TransactionType,
  TransactionStatus,
} from "../entities/wallet-transaction.entity";

export interface ListTransactionsQueryDto {
  walletId?: string;
  userId?: string;
  page?: number;
  limit?: number;
  type?: TransactionType;
  direction?: TransactionDirection;
  status?: TransactionStatus;
  startDate?: string;
  endDate?: string;
}
