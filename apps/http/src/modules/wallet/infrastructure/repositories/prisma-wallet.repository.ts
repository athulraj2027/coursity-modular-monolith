import { PrismaClient, Prisma } from "@prisma/client";
import defaultPrisma from "@/infrastructure/database/prisma.client";
import { IWalletRepository } from "../../domain/repositories/wallet.repository.interface";
import { WalletEntity } from "../../domain/entities/wallet.entity";
import {
  WalletTransactionEntity,
  TransactionType,
} from "../../domain/entities/wallet-transaction.entity";
import { AdminListWalletsQueryDto } from "../../domain/dtos/wallet.dto";
import { ListTransactionsQueryDto } from "../../domain/dtos/wallet-transaction.dto";
import { BadRequestError, NotFoundError } from "@/app/errors";

export class PrismaWalletRepository implements IWalletRepository {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  private mapToWalletEntity(raw: any): WalletEntity {
    const balance = Number(raw.balance);
    const lockedBalance = Number(raw.lockedBalance);
    return {
      id: raw.id,
      userId: raw.userId,
      balance,
      lockedBalance,
      availableBalance: Math.max(0, balance - lockedBalance),
      currency: raw.currency,
      status: raw.status,
      totalEarned: Number(raw.totalEarned || 0),
      totalSpent: Number(raw.totalSpent || 0),
      totalWithdrawn: Number(raw.totalWithdrawn || 0),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  private mapToTransactionEntity(raw: any): WalletTransactionEntity {
    return {
      id: raw.id,
      walletId: raw.walletId,
      type: raw.type,
      direction: raw.direction,
      amount: Number(raw.amount),
      balanceBefore: Number(raw.balanceBefore),
      balanceAfter: Number(raw.balanceAfter),
      currency: raw.currency,
      status: raw.status,
      description: raw.description,
      referenceType: raw.referenceType,
      referenceId: raw.referenceId,
      razorpayOrderId: raw.razorpayOrderId,
      razorpayPaymentId: raw.razorpayPaymentId,
      performedByUserId: raw.performedByUserId,
      notes: raw.notes,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  async getOrCreateByUserId(userId: string): Promise<WalletEntity> {
    let wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      wallet = await this.prisma.wallet.create({
        data: {
          userId,
          balance: 0.0,
          lockedBalance: 0.0,
          currency: "INR",
          status: "ACTIVE",
        },
      });
    }

    return this.mapToWalletEntity(wallet);
  }

  async findByUserId(userId: string): Promise<WalletEntity | null> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });
    return wallet ? this.mapToWalletEntity(wallet) : null;
  }

  async findById(walletId: string): Promise<WalletEntity | null> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
    });
    return wallet ? this.mapToWalletEntity(wallet) : null;
  }

  async credit(params: {
    userId: string;
    amount: number;
    type: TransactionType;
    description: string;
    referenceType?: string;
    referenceId?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    performedByUserId?: string;
    notes?: string;
  }): Promise<{ wallet: WalletEntity; transaction: WalletTransactionEntity }> {
    if (params.amount <= 0) {
      throw new BadRequestError("Credit amount must be greater than 0");
    }

    return await this.prisma.$transaction(async (tx) => {
      // 1. Ensure or get wallet
      let wallet = await tx.wallet.findUnique({
        where: { userId: params.userId },
      });

      if (!wallet) {
        wallet = await tx.wallet.create({
          data: {
            userId: params.userId,
            balance: 0.0,
            lockedBalance: 0.0,
          },
        });
      }

      const balanceBefore = Number(wallet.balance);
      const balanceAfter = balanceBefore + params.amount;

      // Update analytics counters if earning
      const isEarning = params.type === "EARNING";
      const totalEarnedUpdate = isEarning
        ? { increment: params.amount }
        : undefined;

      // 2. Update wallet balance
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: { increment: params.amount },
          ...(totalEarnedUpdate ? { totalEarned: totalEarnedUpdate } : {}),
        },
      });

      // 3. Create immutable ledger record
      const transaction = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: params.type as any,
          direction: "CREDIT",
          amount: params.amount,
          balanceBefore,
          balanceAfter,
          currency: wallet.currency,
          status: "COMPLETED",
          description: params.description,
          referenceType: params.referenceType,
          referenceId: params.referenceId,
          razorpayOrderId: params.razorpayOrderId,
          razorpayPaymentId: params.razorpayPaymentId,
          performedByUserId: params.performedByUserId,
          notes: params.notes,
        },
      });

      return {
        wallet: this.mapToWalletEntity(updatedWallet),
        transaction: this.mapToTransactionEntity(transaction),
      };
    });
  }

  async debit(params: {
    userId: string;
    amount: number;
    type: TransactionType;
    description: string;
    referenceType?: string;
    referenceId?: string;
    performedByUserId?: string;
    notes?: string;
  }): Promise<{ wallet: WalletEntity; transaction: WalletTransactionEntity }> {
    if (params.amount <= 0) {
      throw new BadRequestError("Debit amount must be greater than 0");
    }

    return await this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId: params.userId },
      });

      if (!wallet) {
        throw new NotFoundError("User wallet not found");
      }

      const balanceBefore = Number(wallet.balance);
      const locked = Number(wallet.lockedBalance);
      const available = balanceBefore - locked;

      if (available < params.amount) {
        throw new BadRequestError(
          `Insufficient wallet balance. Available: ₹${available.toFixed(2)}, Requested: ₹${params.amount.toFixed(2)}`
        );
      }

      const balanceAfter = balanceBefore - params.amount;
      const isSpend = params.type === "ENROLLMENT_PAYMENT";

      // 1. Update wallet balance
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: { decrement: params.amount },
          ...(isSpend ? { totalSpent: { increment: params.amount } } : {}),
        },
      });

      // 2. Create immutable ledger record
      const transaction = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: params.type as any,
          direction: "DEBIT",
          amount: params.amount,
          balanceBefore,
          balanceAfter,
          currency: wallet.currency,
          status: "COMPLETED",
          description: params.description,
          referenceType: params.referenceType,
          referenceId: params.referenceId,
          performedByUserId: params.performedByUserId,
          notes: params.notes,
        },
      });

      return {
        wallet: this.mapToWalletEntity(updatedWallet),
        transaction: this.mapToTransactionEntity(transaction),
      };
    });
  }

  async getTransactions(
    query: ListTransactionsQueryDto
  ): Promise<{ items: WalletTransactionEntity[]; total: number }> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 15));
    const skip = (page - 1) * limit;

    let walletId = query.walletId;
    if (!walletId && query.userId) {
      const wallet = await this.prisma.wallet.findUnique({
        where: { userId: query.userId },
        select: { id: true },
      });
      walletId = wallet?.id;
    }

    if (!walletId) {
      return { items: [], total: 0 };
    }

    const where: Prisma.WalletTransactionWhereInput = {
      walletId,
      ...(query.type ? { type: query.type as any } : {}),
      ...(query.direction ? { direction: query.direction as any } : {}),
      ...(query.status ? { status: query.status as any } : {}),
      ...(query.startDate || query.endDate
        ? {
            createdAt: {
              ...(query.startDate ? { gte: new Date(query.startDate) } : {}),
              ...(query.endDate ? { lte: new Date(query.endDate) } : {}),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.walletTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.walletTransaction.count({ where }),
    ]);

    return {
      items: items.map((tx) => this.mapToTransactionEntity(tx)),
      total,
    };
  }

  async adminListWallets(query: AdminListWalletsQueryDto): Promise<{
    items: Array<WalletEntity & { user: { id: string; name: string; email: string; role: string } }>;
    total: number;
    stats: {
      totalPlatformBalance: number;
      totalLockedBalance: number;
      totalLifetimeEarned: number;
      totalLifetimeWithdrawn: number;
    };
  }> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.WalletWhereInput = {
      ...(query.status ? { status: query.status as any } : {}),
      ...(query.search
        ? {
            user: {
              OR: [
                { name: { contains: query.search, mode: "insensitive" } },
                { email: { contains: query.search, mode: "insensitive" } },
              ],
            },
          }
        : {}),
    };

    const [items, total, aggregate] = await Promise.all([
      this.prisma.wallet.findMany({
        where,
        skip,
        take: limit,
        orderBy: { balance: "desc" },
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      }),
      this.prisma.wallet.count({ where }),
      this.prisma.wallet.aggregate({
        _sum: {
          balance: true,
          lockedBalance: true,
          totalEarned: true,
          totalWithdrawn: true,
        },
      }),
    ]);

    return {
      items: items.map((w) => ({
        ...this.mapToWalletEntity(w),
        user: {
          id: w.user.id,
          name: w.user.name,
          email: w.user.email,
          role: w.user.role,
        },
      })),
      total,
      stats: {
        totalPlatformBalance: Number(aggregate._sum.balance || 0),
        totalLockedBalance: Number(aggregate._sum.lockedBalance || 0),
        totalLifetimeEarned: Number(aggregate._sum.totalEarned || 0),
        totalLifetimeWithdrawn: Number(aggregate._sum.totalWithdrawn || 0),
      },
    };
  }
}
