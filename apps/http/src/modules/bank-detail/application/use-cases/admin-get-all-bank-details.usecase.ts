import { IBankDetailRepository, PaginatedBankDetailsResult } from "../../domain/repositories/bank-detail.repository.interface";
import { AdminBankDetailsQueryDto } from "../../domain/dtos/bank-detail.dto";

export class AdminGetAllBankDetailsUseCase {
  constructor(private readonly bankDetailRepo: IBankDetailRepository) {}

  async execute(query: AdminBankDetailsQueryDto): Promise<PaginatedBankDetailsResult> {
    return this.bankDetailRepo.adminFindAll(query);
  }
}
