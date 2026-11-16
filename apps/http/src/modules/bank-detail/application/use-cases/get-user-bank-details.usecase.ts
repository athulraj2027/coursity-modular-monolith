import { IUserBankDetailRepository } from "../../domain/repositories/bank-detail.repository.interface";
import { BankDetailEntity } from "../../domain/entities/bank-detail.entity";

export class GetUserBankDetailsUseCase {
  constructor(private readonly bankDetailRepo: IUserBankDetailRepository) {}

  async execute(userId: string): Promise<BankDetailEntity[]> {
    return this.bankDetailRepo.findByUserId(userId);
  }
}
