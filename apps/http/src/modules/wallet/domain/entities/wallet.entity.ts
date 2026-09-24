export type WalletStatus = "ACTIVE" | "FROZEN" | "SUSPENDED";

export interface WalletEntity {
  id: string;
  userId: string;
  balance: number;
  lockedBalance: number;
  availableBalance: number;
  currency: string;
  status: WalletStatus;
  totalEarned: number;
  totalSpent: number;
  totalWithdrawn: number;
  createdAt: Date;
  updatedAt: Date;
}
