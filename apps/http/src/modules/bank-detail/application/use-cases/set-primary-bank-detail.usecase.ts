import { IUserBankDetailRepository } from "../../domain/repositories/bank-detail.repository.interface";
import { BankDetailEntity } from "../../domain/entities/bank-detail.entity";
import { NotFoundError } from "@/app/errors";

export class SetPrimaryBankDetailUseCase {
  constructor(private readonly bankDetailRepo: IUserBankDetailRepository) {}

  async execute(id: string, userId: string): Promise<BankDetailEntity> {
    const existing = await this.bankDetailRepo.findById(id);
    if (!existing || existing.userId !== userId) {
      throw new NotFoundError("Bank account not found or access denied");
    }

    return this.bankDetailRepo.setPrimary(id, userId);
  }
}
