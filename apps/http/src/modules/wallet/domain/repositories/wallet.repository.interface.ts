import { WalletEntity } from "../entities/wallet.entity";
import {
  WalletTransactionEntity,
  TransactionType,
  TransactionDirection,
} from "../entities/wallet-transaction.entity";
import {
  AdminListWalletsQueryDto,
  AdminWalletAdjustmentDto,
} from "../dtos/wallet.dto";
import { ListTransactionsQueryDto } from "../dtos/wallet-transaction.dto";

export interface IWalletRepository {
  /**
   * Get or automatically initialize a wallet for a user
   */
  getOrCreateByUserId(userId: string): Promise<WalletEntity>;

  /**
   * Find wallet by user ID
   */
  findByUserId(userId: string): Promise<WalletEntity | null>;

  /**
   * Find wallet by wallet ID
   */
  findById(walletId: string): Promise<WalletEntity | null>;

  /**
   * Atomic credit balance and log transaction
   */
  credit(params: {
    userId: string;
    amount: number;
    type: TransactionType;
    description: string;
    referenceType?: string;
    referenceId?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    performedByUserId?: string;
    notes?: string;
  }): Promise<{ wallet: WalletEntity; transaction: WalletTransactionEntity }>;

  /**
   * Atomic debit balance and log transaction
   */
  debit(params: {
    userId: string;
    amount: number;
    type: TransactionType;
    description: string;
    referenceType?: string;
    referenceId?: string;
    performedByUserId?: string;
    notes?: string;
  }): Promise<{ wallet: WalletEntity; transaction: WalletTransactionEntity }>;

  /**
   * Get paginated transactions for a wallet or user
   */
  getTransactions(
    query: ListTransactionsQueryDto
  ): Promise<{ items: WalletTransactionEntity[]; total: number }>;

  /**
   * Admin list all user wallets
   */
  adminListWallets(
    query: AdminListWalletsQueryDto
  ): Promise<{
    items: Array<WalletEntity & { user: { id: string; name: string; email: string; role: string } }>;
    total: number;
    stats: {
      totalPlatformBalance: number;
      totalLockedBalance: number;
      totalLifetimeEarned: number;
      totalLifetimeWithdrawn: number;
    };
  }>;
}
