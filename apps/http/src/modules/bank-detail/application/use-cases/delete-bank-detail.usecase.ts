import { IUserBankDetailRepository } from "../../domain/repositories/bank-detail.repository.interface";
import { NotFoundError } from "@/app/errors";

export class DeleteBankDetailUseCase {
  constructor(private readonly bankDetailRepo: IUserBankDetailRepository) {}

  async execute(id: string, userId: string): Promise<{ success: boolean; message: string }> {
    const existing = await this.bankDetailRepo.findById(id);
    if (!existing || existing.userId !== userId) {
      throw new NotFoundError("Bank account not found or access denied");
    }

    const deleted = await this.bankDetailRepo.deleteForUser(id, userId);
    return {
      success: deleted,
      message: "Bank account removed successfully",
    };
  }
}
