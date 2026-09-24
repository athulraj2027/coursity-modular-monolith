import { IWalletRepository } from "../../domain/repositories/wallet.repository.interface";
import { AdminWalletAdjustmentDto } from "../../domain/dtos/wallet.dto";
import { WalletEntity } from "../../domain/entities/wallet.entity";
import { WalletTransactionEntity } from "../../domain/entities/wallet-transaction.entity";
import { BadRequestError } from "@/app/errors";

export class AdminWalletAdjustmentUseCase {
  constructor(private readonly walletRepo: IWalletRepository) {}

  async execute(dto: AdminWalletAdjustmentDto): Promise<{
    wallet: WalletEntity;
    transaction: WalletTransactionEntity;
  }> {
    if (!dto.reason || dto.reason.trim().length < 5) {
      throw new BadRequestError("A descriptive reason (min 5 chars) is required for admin wallet adjustments");
    }

    if (dto.direction === "CREDIT") {
      return this.walletRepo.credit({
        userId: dto.userId,
        amount: dto.amount,
        type: "ADJUSTMENT",
        description: `Admin balance adjustment: ${dto.reason.trim()}`,
        referenceType: "ADMIN_ADJUSTMENT",
        performedByUserId: dto.performedByUserId,
        notes: dto.reason.trim(),
      });
    } else {
      return this.walletRepo.debit({
        userId: dto.userId,
        amount: dto.amount,
        type: "ADJUSTMENT",
        description: `Admin balance deduction: ${dto.reason.trim()}`,
        referenceType: "ADMIN_ADJUSTMENT",
        performedByUserId: dto.performedByUserId,
        notes: dto.reason.trim(),
      });
    }
  }
}
