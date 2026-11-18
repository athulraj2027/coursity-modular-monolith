import { IWalletQueryRepository } from "../../domain/repositories/wallet.repository.interface";
import { WalletEntity } from "../../domain/entities/wallet.entity";

export class GetOrCreateWalletUseCase {
  constructor(private readonly walletRepo: IWalletQueryRepository) {}

  async execute(userId: string): Promise<WalletEntity> {
    return this.walletRepo.getOrCreateByUserId(userId);
  }
}
