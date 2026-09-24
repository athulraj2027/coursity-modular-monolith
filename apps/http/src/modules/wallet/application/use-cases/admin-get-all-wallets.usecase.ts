import { IWalletRepository } from "../../domain/repositories/wallet.repository.interface";
import { AdminListWalletsQueryDto } from "../../domain/dtos/wallet.dto";
import { WalletEntity } from "../../domain/entities/wallet.entity";

export class AdminGetAllWalletsUseCase {
  constructor(private readonly walletRepo: IWalletRepository) {}

  async execute(query: AdminListWalletsQueryDto): Promise<{
    items: Array<WalletEntity & { user: { id: string; name: string; email: string; role: string } }>;
    total: number;
    stats: {
      totalPlatformBalance: number;
      totalLockedBalance: number;
      totalLifetimeEarned: number;
      totalLifetimeWithdrawn: number;
    };
  }> {
    return this.walletRepo.adminListWallets(query);
  }
}
