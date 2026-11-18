import { IWalletMutationRepository } from "../../domain/repositories/wallet.repository.interface";
import { AdminWalletAdjustmentDto } from "../../domain/dtos/wallet.dto";
import { WalletEntity } from "../../domain/entities/wallet.entity";
import { WalletTransactionEntity } from "../../domain/entities/wallet-transaction.entity";
import { WalletAdjustmentPolicy } from "../../domain/policies/wallet-adjustment.policy";

export class AdminWalletAdjustmentUseCase {
  constructor(private readonly walletRepo: IWalletMutationRepository) {}

  async execute(dto: AdminWalletAdjustmentDto): Promise<{
    wallet: WalletEntity;
    transaction: WalletTransactionEntity;
  }> {
    WalletAdjustmentPolicy.validateReason(dto.reason);

    const description = WalletAdjustmentPolicy.formatAdjustmentDescription(
      dto.direction,
      dto.reason
    );

    if (dto.direction === "CREDIT") {
      return this.walletRepo.credit({
        userId: dto.userId,
        amount: dto.amount,
        type: "ADJUSTMENT",
        description,
        referenceType: "ADMIN_ADJUSTMENT",
        performedByUserId: dto.performedByUserId,
        notes: dto.reason.trim(),
      });
    } else {
      return this.walletRepo.debit({
        userId: dto.userId,
        amount: dto.amount,
        type: "ADJUSTMENT",
        description,
        referenceType: "ADMIN_ADJUSTMENT",
        performedByUserId: dto.performedByUserId,
        notes: dto.reason.trim(),
      });
    }
  }
}
