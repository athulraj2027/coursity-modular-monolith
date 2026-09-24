import { PrismaClient, Prisma } from "@prisma/client";
import defaultPrisma from "@/infrastructure/database/prisma.client";
import { IPayoutRequestRepository } from "../../domain/repositories/payout-request.repository.interface";
import { PayoutRequestEntity } from "../../domain/entities/payout-request.entity";
import {
  ListPayoutsQueryDto,
  AdminProcessPayoutDto,
} from "../../domain/dtos/payout-request.dto";
import { BadRequestError, NotFoundError } from "@/app/errors";

export class PrismaPayoutRequestRepository implements IPayoutRequestRepository {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  private mapToEntity(raw: any): PayoutRequestEntity {
    return {
      id: raw.id,
      walletId: raw.walletId,
      userId: raw.userId,
      bankDetailId: raw.bankDetailId,
      amount: Number(raw.amount),
      currency: raw.currency,
      status: raw.status,
      payoutMethod: raw.payoutMethod,
      accountSummary: raw.accountSummary,
      processedByUserId: raw.processedByUserId,
      processedAt: raw.processedAt,
      rejectionReason: raw.rejectionReason,
      transactionRef: raw.transactionRef,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      user: raw.wallet?.user || raw.user || null,
      bankDetail: raw.bankDetail
        ? {
            id: raw.bankDetail.id,
            methodType: raw.bankDetail.methodType,
            accountHolderName: raw.bankDetail.accountHolderName,
            accountNumber: raw.bankDetail.accountNumber,
            ifscCode: raw.bankDetail.ifscCode,
            bankName: raw.bankDetail.bankName,
            branchName: raw.bankDetail.branchName,
            accountType: raw.bankDetail.accountType,
            upiId: raw.bankDetail.upiId,
          }
        : null,
    };
  }

  async createRequest(params: {
    userId: string;
    amount: number;
    bankDetailId: string;
  }): Promise<PayoutRequestEntity> {
    if (params.amount < 500) {
      throw new BadRequestError("Minimum withdrawal amount is ₹500");
    }

    return await this.prisma.$transaction(async (tx) => {
      // 1. Get or find wallet
      const wallet = await tx.wallet.findUnique({
        where: { userId: params.userId },
      });

      if (!wallet) {
        throw new NotFoundError("Wallet record not found");
      }

      const balance = Number(wallet.balance);
      const locked = Number(wallet.lockedBalance);
      const available = balance - locked;

      if (available < params.amount) {
        throw new BadRequestError(
          `Insufficient available balance. Available: ₹${available.toFixed(2)}, Requested: ₹${params.amount.toFixed(2)}`
        );
      }

      // 2. Fetch Bank Details & Validate
      let bankDetail = await tx.bankDetail.findFirst({
        where: {
          id: params.bankDetailId,
          userId: params.userId,
        },
      });

      if (!bankDetail) {
        // Fallback to primary bank detail if specific ID not provided
        bankDetail = await tx.bankDetail.findFirst({
          where: {
            userId: params.userId,
            isPrimary: true,
          },
        });
      }

      if (!bankDetail) {
        throw new BadRequestError("Please configure a bank account or UPI ID before requesting a payout");
      }

      const accountSummary =
        bankDetail.methodType === "UPI"
          ? `UPI: ${bankDetail.upiId}`
          : `${bankDetail.bankName} (A/C: ••••${bankDetail.accountNumber.slice(-4)})`;

      // 3. Atomically lock the withdrawal amount
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          lockedBalance: { increment: params.amount },
        },
      });

      // 4. Create Payout Request
      const payoutRequest = await tx.payoutRequest.create({
        data: {
          walletId: wallet.id,
          userId: params.userId,
          bankDetailId: bankDetail.id,
          amount: params.amount,
          currency: wallet.currency,
          status: "PENDING",
          payoutMethod: bankDetail.methodType as any,
          accountSummary,
        },
        include: {
          bankDetail: true,
        },
      });

      return this.mapToEntity(payoutRequest);
    });
  }

  async findById(id: string): Promise<PayoutRequestEntity | null> {
    const record = await this.prisma.payoutRequest.findUnique({
      where: { id },
      include: {
        bankDetail: true,
        wallet: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
        },
      },
    });

    return record ? this.mapToEntity(record) : null;
  }

  async findByUserId(
    query: ListPayoutsQueryDto
  ): Promise<{ items: PayoutRequestEntity[]; total: number }> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.PayoutRequestWhereInput = {
      ...(query.userId ? { userId: query.userId } : {}),
      ...(query.status ? { status: query.status as any } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.payoutRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          bankDetail: true,
        },
      }),
      this.prisma.payoutRequest.count({ where }),
    ]);

    return {
      items: items.map((p) => this.mapToEntity(p)),
      total,
    };
  }

  async adminListPayouts(query: ListPayoutsQueryDto): Promise<{
    items: PayoutRequestEntity[];
    total: number;
    stats: {
      pendingAmount: number;
      pendingCount: number;
      completedAmount: number;
      completedCount: number;
    };
  }> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.PayoutRequestWhereInput = {
      ...(query.status ? { status: query.status as any } : {}),
      ...(query.userId ? { userId: query.userId } : {}),
      ...(query.search
        ? {
            wallet: {
              user: {
                OR: [
                  { name: { contains: query.search, mode: "insensitive" } },
                  { email: { contains: query.search, mode: "insensitive" } },
                ],
              },
            },
          }
        : {}),
    };

    const [items, total, pendingAgg, completedAgg] = await Promise.all([
      this.prisma.payoutRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          bankDetail: true,
          wallet: {
            include: {
              user: {
                select: { id: true, name: true, email: true, role: true },
              },
            },
          },
        },
      }),
      this.prisma.payoutRequest.count({ where }),
      this.prisma.payoutRequest.aggregate({
        where: { status: "PENDING" },
        _sum: { amount: true },
        _count: { id: true },
      }),
      this.prisma.payoutRequest.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true },
        _count: { id: true },
      }),
    ]);

    return {
      items: items.map((p) => this.mapToEntity(p)),
      total,
      stats: {
        pendingAmount: Number(pendingAgg._sum.amount || 0),
        pendingCount: pendingAgg._count.id || 0,
        completedAmount: Number(completedAgg._sum.amount || 0),
        completedCount: completedAgg._count.id || 0,
      },
    };
  }

  async processPayout(dto: AdminProcessPayoutDto): Promise<PayoutRequestEntity> {
    return await this.prisma.$transaction(async (tx) => {
      const payout = await tx.payoutRequest.findUnique({
        where: { id: dto.id },
        include: { wallet: true },
      });

      if (!payout) {
        throw new NotFoundError("Payout request not found");
      }

      if (payout.status === "COMPLETED" || payout.status === "REJECTED") {
        throw new BadRequestError(`Payout request is already ${payout.status.toLowerCase()}`);
      }

      const amount = Number(payout.amount);
      const now = new Date();

      if (dto.status === "COMPLETED") {
        // 1. Deduct balance and locked balance, increment totalWithdrawn
        const balanceBefore = Number(payout.wallet.balance);
        const balanceAfter = balanceBefore - amount;

        await tx.wallet.update({
          where: { id: payout.walletId },
          data: {
            balance: { decrement: amount },
            lockedBalance: { decrement: amount },
            totalWithdrawn: { increment: amount },
          },
        });

        // 2. Create PAYOUT_WITHDRAWAL transaction record
        await tx.walletTransaction.create({
          data: {
            walletId: payout.walletId,
            type: "PAYOUT_WITHDRAWAL",
            direction: "DEBIT",
            amount,
            balanceBefore,
            balanceAfter,
            currency: payout.currency,
            status: "COMPLETED",
            description: `Payout withdrawal disbursed to ${payout.accountSummary}`,
            referenceType: "PAYOUT",
            referenceId: payout.id,
            performedByUserId: dto.processedByUserId,
            notes: dto.transactionRef ? `UTR/Ref: ${dto.transactionRef}` : undefined,
          },
        });

        // 3. Mark payout completed
        const updatedPayout = await tx.payoutRequest.update({
          where: { id: payout.id },
          data: {
            status: "COMPLETED",
            processedByUserId: dto.processedByUserId,
            processedAt: now,
            transactionRef: dto.transactionRef,
          },
          include: {
            bankDetail: true,
            wallet: {
              include: {
                user: {
                  select: { id: true, name: true, email: true, role: true },
                },
              },
            },
          },
        });

        return this.mapToEntity(updatedPayout);
      } else if (dto.status === "REJECTED") {
        // Unlock the locked funds back to available balance
        await tx.wallet.update({
          where: { id: payout.walletId },
          data: {
            lockedBalance: { decrement: amount },
          },
        });

        // Mark payout rejected
        const updatedPayout = await tx.payoutRequest.update({
          where: { id: payout.id },
          data: {
            status: "REJECTED",
            rejectionReason: dto.rejectionReason || "Payout request rejected by administration",
            processedByUserId: dto.processedByUserId,
            processedAt: now,
          },
          include: {
            bankDetail: true,
            wallet: {
              include: {
                user: {
                  select: { id: true, name: true, email: true, role: true },
                },
              },
            },
          },
        });

        return this.mapToEntity(updatedPayout);
      } else {
        // Status PROCESSING
        const updatedPayout = await tx.payoutRequest.update({
          where: { id: payout.id },
          data: {
            status: "PROCESSING",
            processedByUserId: dto.processedByUserId,
          },
          include: {
            bankDetail: true,
            wallet: {
              include: {
                user: {
                  select: { id: true, name: true, email: true, role: true },
                },
              },
            },
          },
        });

        return this.mapToEntity(updatedPayout);
      }
    });
  }
}
