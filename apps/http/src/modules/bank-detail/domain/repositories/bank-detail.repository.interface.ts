import { IBaseRepository } from "@/shared/domain/repositories/base.repository.interface";
import { BankDetailEntity } from "../entities/bank-detail.entity";
import {
  CreateBankDetailDto,
  UpdateBankDetailDto,
  AdminBankDetailsQueryDto,
  UpdateBankVerificationDto,
} from "../dtos/bank-detail.dto";

export interface PaginatedBankDetailsResult {
  items: BankDetailEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Interface Segregation: User-facing Bank Detail operations
 */
export interface IUserBankDetailRepository {
  create(dto: CreateBankDetailDto): Promise<BankDetailEntity>;
  findById(id: string): Promise<BankDetailEntity | null>;
  findByUserId(userId: string): Promise<BankDetailEntity[]>;
  countByUserId(userId: string): Promise<number>;
  setPrimary(id: string, userId: string): Promise<BankDetailEntity>;
  delete(id: string): Promise<boolean>;
  deleteForUser(id: string, userId: string): Promise<boolean>;
}

/**
 * Interface Segregation: Admin-facing Bank Detail operations
 */
export interface IAdminBankDetailRepository {
  findById(id: string): Promise<BankDetailEntity | null>;
  adminFindAll(query: AdminBankDetailsQueryDto): Promise<PaginatedBankDetailsResult>;
  adminUpdateVerification(dto: UpdateBankVerificationDto): Promise<BankDetailEntity>;
}

/**
 * Unified Bank Detail Repository contract
 */
export interface IBankDetailRepository
  extends IUserBankDetailRepository,
    IAdminBankDetailRepository,
    IBaseRepository<
      BankDetailEntity,
      string,
      CreateBankDetailDto,
      UpdateBankDetailDto,
      AdminBankDetailsQueryDto
    > {
  create(dto: CreateBankDetailDto): Promise<BankDetailEntity>;
  findById(id: string): Promise<BankDetailEntity | null>;
  findByUserId(userId: string): Promise<BankDetailEntity[]>;
  countByUserId(userId: string): Promise<number>;
  setPrimary(id: string, userId: string): Promise<BankDetailEntity>;
  delete(id: string, userId?: string): Promise<boolean>;
  deleteForUser(id: string, userId: string): Promise<boolean>;
  adminFindAll(query: AdminBankDetailsQueryDto): Promise<PaginatedBankDetailsResult>;
  adminUpdateVerification(dto: UpdateBankVerificationDto): Promise<BankDetailEntity>;
}
