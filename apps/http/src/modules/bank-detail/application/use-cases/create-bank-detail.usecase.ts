import { IUserBankDetailRepository } from "../../domain/repositories/bank-detail.repository.interface";
import { CreateBankDetailDto } from "../../domain/dtos/bank-detail.dto";
import { BankDetailEntity } from "../../domain/entities/bank-detail.entity";
import { BankDetailValidationPolicy } from "../../domain/policies/bank-detail-validation.policy";

export class CreateBankDetailUseCase {
  constructor(private readonly bankDetailRepo: IUserBankDetailRepository) {}

  async execute(
    userIdOrDto: string | CreateBankDetailDto,
    data?: Partial<CreateBankDetailDto>
  ): Promise<BankDetailEntity> {
    const dto: CreateBankDetailDto =
      typeof userIdOrDto === "string"
        ? ({ ...data, userId: userIdOrDto } as CreateBankDetailDto)
        : userIdOrDto;

    // 1. Domain Validation Policy
    BankDetailValidationPolicy.validate(dto);

    // 2. Primary Account Logic: First account is automatically primary unless explicitly specified
    const existingCount = await this.bankDetailRepo.countByUserId(dto.userId);
    const isPrimary = existingCount === 0 || dto.isPrimary === true;

    // 3. Persist normalized bank detail
    return this.bankDetailRepo.create({
      ...dto,
      methodType: dto.methodType || "BANK_ACCOUNT",
      accountHolderName: dto.accountHolderName.trim(),
      accountNumber: dto.accountNumber ? BankDetailValidationPolicy.normalizeAccountNumber(dto.accountNumber) : "",
      ifscCode: dto.ifscCode ? BankDetailValidationPolicy.normalizeIfsc(dto.ifscCode) : "",
      bankName: dto.bankName ? dto.bankName.trim() : "",
      branchName: dto.branchName ? dto.branchName.trim() : undefined,
      accountType: dto.accountType || "SAVINGS",
      upiId: dto.upiId ? BankDetailValidationPolicy.normalizeUpi(dto.upiId) : undefined,
      isPrimary,
      verificationStatus: dto.verificationStatus || "PENDING",
    });
  }
}
