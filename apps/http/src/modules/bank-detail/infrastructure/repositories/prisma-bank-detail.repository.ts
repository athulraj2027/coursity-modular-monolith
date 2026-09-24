import { PrismaClient } from "@prisma/client";
import {
  IBankDetailRepository,
  PaginatedBankDetailsResult,
} from "../../domain/repositories/bank-detail.repository.interface";
import {
  CreateBankDetailDto,
  AdminBankDetailsQueryDto,
  UpdateBankVerificationDto,
} from "../../domain/dtos/bank-detail.dto";
import { BankDetailEntity } from "../../domain/entities/bank-detail.entity";

export class PrismaBankDetailRepository implements IBankDetailRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(dto: CreateBankDetailDto): Promise<BankDetailEntity> {
    return this.prisma.$transaction(async (tx: any) => {
      // If this is set as primary, un-primary all existing bank details for this user
      if (dto.isPrimary) {
        await tx.bankDetail.updateMany({
          where: { userId: dto.userId },
          data: { isPrimary: false },
        });
      }

      const created = await tx.bankDetail.create({
        data: {
          userId: dto.userId,
          methodType: dto.methodType || "BANK_ACCOUNT",
          accountHolderName: dto.accountHolderName.trim(),
          accountNumber: dto.accountNumber ? dto.accountNumber.trim() : "",
          ifscCode: dto.ifscCode ? dto.ifscCode.toUpperCase().trim() : "",
          bankName: dto.bankName ? dto.bankName.trim() : "",
          branchName: dto.branchName ? dto.branchName.trim() : null,
          accountType: dto.accountType || "SAVINGS",
          upiId: dto.upiId ? dto.upiId.trim() : null,
          isPrimary: dto.isPrimary ?? true,
          verificationStatus: "VERIFIED", // Verified by default or ready for verification
          verifiedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });

      return created as BankDetailEntity;
    });
  }

  async findById(id: string): Promise<BankDetailEntity | null> {
    const record = await (this.prisma as any).bankDetail.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return record as BankDetailEntity | null;
  }

  async findByUserId(userId: string): Promise<BankDetailEntity[]> {
    const records = await (this.prisma as any).bankDetail.findMany({
      where: { userId },
      orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }],
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return records as BankDetailEntity[];
  }

  async countByUserId(userId: string): Promise<number> {
    return (this.prisma as any).bankDetail.count({
      where: { userId },
    });
  }

  async setPrimary(id: string, userId: string): Promise<BankDetailEntity> {
    return this.prisma.$transaction(async (tx: any) => {
      // Unset previous primary
      await tx.bankDetail.updateMany({
        where: { userId },
        data: { isPrimary: false },
      });

      // Set target account as primary
      const updated = await tx.bankDetail.update({
        where: { id },
        data: { isPrimary: true },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });

      return updated as BankDetailEntity;
    });
  }

  async delete(id: string, userId: string): Promise<boolean> {
    return this.prisma.$transaction(async (tx: any) => {
      const target = await tx.bankDetail.findUnique({ where: { id } });
      if (!target || target.userId !== userId) return false;

      await tx.bankDetail.delete({ where: { id } });

      // If the deleted account was primary, make the most recent remaining account primary
      if (target.isPrimary) {
        const nextAccount = await tx.bankDetail.findFirst({
          where: { userId },
          orderBy: { createdAt: "desc" },
        });

        if (nextAccount) {
          await tx.bankDetail.update({
            where: { id: nextAccount.id },
            data: { isPrimary: true },
          });
        }
      }

      return true;
    });
  }

  async adminFindAll(query: AdminBankDetailsQueryDto): Promise<PaginatedBankDetailsResult> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 10));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.status) {
      where.verificationStatus = query.status;
    }

    if (query.methodType) {
      where.methodType = query.methodType;
    }

    if (query.userId) {
      where.userId = query.userId;
    }

    if (query.search) {
      const search = query.search.trim();
      where.OR = [
        { accountHolderName: { contains: search, mode: "insensitive" } },
        { bankName: { contains: search, mode: "insensitive" } },
        { ifscCode: { contains: search, mode: "insensitive" } },
        { upiId: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [total, items] = await Promise.all([
      (this.prisma as any).bankDetail.count({ where }),
      (this.prisma as any).bankDetail.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ createdAt: "desc" }],
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items: items as BankDetailEntity[],
      total,
      page,
      limit,
      totalPages,
    };
  }

  async adminUpdateVerification(dto: UpdateBankVerificationDto): Promise<BankDetailEntity> {
    const updated = await (this.prisma as any).bankDetail.update({
      where: { id: dto.id },
      data: {
        verificationStatus: dto.status,
        verificationNotes: dto.notes ?? null,
        verifiedAt: dto.status === "VERIFIED" ? new Date() : null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return updated as BankDetailEntity;
  }
}
