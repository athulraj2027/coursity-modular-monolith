import { IAdminBankDetailRepository } from "../../domain/repositories/bank-detail.repository.interface";
import { UpdateBankVerificationDto } from "../../domain/dtos/bank-detail.dto";
import { BankDetailEntity } from "../../domain/entities/bank-detail.entity";
import { NotFoundError } from "@/app/errors";

export class AdminUpdateBankVerificationUseCase {
  constructor(private readonly bankDetailRepo: IAdminBankDetailRepository) {}

  async execute(
    idOrDto: string | UpdateBankVerificationDto,
    data?: Partial<UpdateBankVerificationDto>
  ): Promise<BankDetailEntity> {
    const dto: UpdateBankVerificationDto =
      typeof idOrDto === "string"
        ? ({ id: idOrDto, ...data } as UpdateBankVerificationDto)
        : idOrDto;

    const existing = await this.bankDetailRepo.findById(dto.id);
    if (!existing) {
      throw new NotFoundError("Bank account not found");
    }

    return this.bankDetailRepo.adminUpdateVerification(dto);
  }
}
