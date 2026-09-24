import { BankDetailEntity } from "../entities/bank-detail.entity";
import { CreateBankDetailDto, AdminBankDetailsQueryDto, UpdateBankVerificationDto } from "../dtos/bank-detail.dto";

export interface PaginatedBankDetailsResult {
  items: BankDetailEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IBankDetailRepository {
  create(dto: CreateBankDetailDto): Promise<BankDetailEntity>;
  findById(id: string): Promise<BankDetailEntity | null>;
  findByUserId(userId: string): Promise<BankDetailEntity[]>;
  countByUserId(userId: string): Promise<number>;
  setPrimary(id: string, userId: string): Promise<BankDetailEntity>;
  delete(id: string, userId: string): Promise<boolean>;
  adminFindAll(query: AdminBankDetailsQueryDto): Promise<PaginatedBankDetailsResult>;
  adminUpdateVerification(dto: UpdateBankVerificationDto): Promise<BankDetailEntity>;
}
