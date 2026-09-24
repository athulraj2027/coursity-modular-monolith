import { IBankDetailRepository } from "../../domain/repositories/bank-detail.repository.interface";
import { CreateBankDetailDto } from "../../domain/dtos/bank-detail.dto";
import { BankDetailEntity } from "../../domain/entities/bank-detail.entity";
import { BadRequestError } from "@/app/errors";

export class CreateBankDetailUseCase {
  constructor(private readonly bankDetailRepo: IBankDetailRepository) {}

  async execute(dto: CreateBankDetailDto): Promise<BankDetailEntity> {
    if (!dto.userId) {
      throw new BadRequestError("User ID is required");
    }

    if (dto.methodType === "BANK_ACCOUNT") {
      if (!dto.accountHolderName || !dto.accountHolderName.trim()) {
        throw new BadRequestError("Account holder name is required");
      }
      if (!dto.accountNumber || !dto.accountNumber.trim()) {
        throw new BadRequestError("Account number is required");
      }
      if (!dto.ifscCode || !dto.ifscCode.trim()) {
        throw new BadRequestError("IFSC Code is required");
      }
      if (!dto.bankName || !dto.bankName.trim()) {
        throw new BadRequestError("Bank name is required");
      }
    } else if (dto.methodType === "UPI") {
      if (!dto.upiId || !dto.upiId.trim()) {
        throw new BadRequestError("UPI ID is required");
      }
      if (!dto.accountHolderName || !dto.accountHolderName.trim()) {
        throw new BadRequestError("Account holder name is required");
      }
    }

    // Check if this is the user's first account; if so, make it primary
    const existingCount = await this.bankDetailRepo.countByUserId(dto.userId);
    const isPrimary = existingCount === 0 || dto.isPrimary === true;

    return this.bankDetailRepo.create({
      ...dto,
      isPrimary,
      ifscCode: dto.ifscCode ? dto.ifscCode.toUpperCase().trim() : "",
    });
  }
}
