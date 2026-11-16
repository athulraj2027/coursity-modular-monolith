import { IUserBankDetailRepository } from "../../domain/repositories/bank-detail.repository.interface";
import { BankDetailEntity } from "../../domain/entities/bank-detail.entity";
import { NotFoundError } from "@/app/errors";

export class GetBankDetailByIdUseCase {
  constructor(private readonly bankDetailRepo: IUserBankDetailRepository) { }

  async execute(id: string, userId: string): Promise<BankDetailEntity> {
    const bankDetail = await this.bankDetailRepo.findById(id);
    if (!bankDetail || bankDetail.userId !== userId) {
      throw new NotFoundError("Bank account not found or access denied");
    }
    return bankDetail;
  }
}

