import { IAdminBankDetailRepository } from "../../domain/repositories/bank-detail.repository.interface";
import { BankDetailEntity } from "../../domain/entities/bank-detail.entity";
import { NotFoundError } from "@/app/errors";

export class AdminGetBankDetailByIdUseCase {
  constructor(private readonly bankDetailRepo: IAdminBankDetailRepository) {}

  async execute(id: string): Promise<BankDetailEntity> {
    const bankDetail = await this.bankDetailRepo.findById(id);
    if (!bankDetail) {
      throw new NotFoundError("Bank account record not found");
    }
    return bankDetail;
  }
}
