import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import defaultPrisma from "@/infrastructure/database/prisma.client";
import { IPaymentGateway, RazorpayPaymentService } from "@/infrastructure/payment";
import { PrismaWalletRepository } from "./infrastructure/repositories/prisma-wallet.repository";
import { PrismaPayoutRequestRepository } from "./infrastructure/repositories/prisma-payout-request.repository";
import {
  IWalletRepository,
  IWalletQueryRepository,
  IWalletMutationRepository,
  IWalletTransactionRepository,
  IAdminWalletRepository,
} from "./domain/repositories/wallet.repository.interface";
import {
  IPayoutRequestRepository,
  IPayoutRequestQueryRepository,
  IPayoutRequestMutationRepository,
  IAdminPayoutRepository,
} from "./domain/repositories/payout-request.repository.interface";

// Use Cases
import { GetOrCreateWalletUseCase } from "./application/use-cases/get-or-create-wallet.usecase";
import { GetWalletTransactionsUseCase } from "./application/use-cases/get-wallet-transactions.usecase";
import { CreateTopUpOrderUseCase } from "./application/use-cases/create-topup-order.usecase";
import { VerifyTopUpPaymentUseCase } from "./application/use-cases/verify-topup-payment.usecase";
import { RequestPayoutUseCase } from "./application/use-cases/request-payout.usecase";
import { GetUserPayoutsUseCase } from "./application/use-cases/get-user-payouts.usecase";
import { AdminGetAllWalletsUseCase } from "./application/use-cases/admin-get-all-wallets.usecase";
import { AdminGetAllPayoutsUseCase } from "./application/use-cases/admin-get-all-payouts.usecase";
import { AdminProcessPayoutUseCase } from "./application/use-cases/admin-process-payout.usecase";
import { AdminWalletAdjustmentUseCase } from "./application/use-cases/admin-wallet-adjustment.usecase";

// Controllers & Routes
import { WalletController } from "./presentation/controllers/wallet.controller";
import { createWalletRouter, WalletRouterOptions } from "./presentation/routes/wallet.routes";

export interface WalletModuleDependencies {
  walletRepo?: IWalletRepository;
  payoutRepo?: IPayoutRequestRepository;
  paymentGateway?: IPaymentGateway;
  routerOptions?: WalletRouterOptions;
}

export function createWalletModule(
  depsOrPrisma?: WalletModuleDependencies | PrismaClient,
  paymentGatewayArg?: IPaymentGateway
) {
  let walletRepo: IWalletRepository;
  let payoutRepo: IPayoutRequestRepository;
  let paymentGateway: IPaymentGateway;
  let routerOptions: WalletRouterOptions | undefined;

  if (depsOrPrisma && "$transaction" in depsOrPrisma) {
    // Legacy invocation: createWalletModule(prisma, paymentGateway)
    walletRepo = new PrismaWalletRepository(depsOrPrisma as PrismaClient);
    payoutRepo = new PrismaPayoutRequestRepository(depsOrPrisma as PrismaClient);
    paymentGateway = paymentGatewayArg || new RazorpayPaymentService();
  } else {
    // Options container invocation
    const deps = (depsOrPrisma as WalletModuleDependencies) || {};
    walletRepo = deps.walletRepo || new PrismaWalletRepository(defaultPrisma);
    payoutRepo = deps.payoutRepo || new PrismaPayoutRequestRepository(defaultPrisma);
    paymentGateway = deps.paymentGateway || paymentGatewayArg || new RazorpayPaymentService();
    routerOptions = deps.routerOptions;
  }

  const getOrCreateWalletUseCase = new GetOrCreateWalletUseCase(walletRepo);
  const getWalletTransactionsUseCase = new GetWalletTransactionsUseCase(walletRepo);
  const createTopUpOrderUseCase = new CreateTopUpOrderUseCase(paymentGateway);
  const verifyTopUpPaymentUseCase = new VerifyTopUpPaymentUseCase(walletRepo, paymentGateway);
  const requestPayoutUseCase = new RequestPayoutUseCase(payoutRepo);
  const getUserPayoutsUseCase = new GetUserPayoutsUseCase(payoutRepo);
  const adminGetAllWalletsUseCase = new AdminGetAllWalletsUseCase(walletRepo);
  const adminGetAllPayoutsUseCase = new AdminGetAllPayoutsUseCase(payoutRepo);
  const adminProcessPayoutUseCase = new AdminProcessPayoutUseCase(payoutRepo);
  const adminWalletAdjustmentUseCase = new AdminWalletAdjustmentUseCase(walletRepo);

  const walletController = new WalletController(
    getOrCreateWalletUseCase,
    getWalletTransactionsUseCase,
    createTopUpOrderUseCase,
    verifyTopUpPaymentUseCase,
    requestPayoutUseCase,
    getUserPayoutsUseCase,
    adminGetAllWalletsUseCase,
    adminGetAllPayoutsUseCase,
    adminProcessPayoutUseCase,
    adminWalletAdjustmentUseCase
  );

  const walletRouter = createWalletRouter(walletController, routerOptions);

  return {
    walletRouter,
    walletRepo,
    payoutRepo,
    walletController,
    getOrCreateWalletUseCase,
    getWalletTransactionsUseCase,
    createTopUpOrderUseCase,
    verifyTopUpPaymentUseCase,
    requestPayoutUseCase,
    getUserPayoutsUseCase,
    adminGetAllWalletsUseCase,
    adminGetAllPayoutsUseCase,
    adminProcessPayoutUseCase,
    adminWalletAdjustmentUseCase,
  };
}

// Default singleton instances
const defaultModule = createWalletModule();
export const walletRouter: Router = defaultModule.walletRouter;
export const walletRepo: IWalletRepository = defaultModule.walletRepo;
export const payoutRepo: IPayoutRequestRepository = defaultModule.payoutRepo;

// Domain Entities
export * from "./domain/entities/wallet.entity";
export * from "./domain/entities/wallet-transaction.entity";
export * from "./domain/entities/payout-request.entity";

// Domain DTOs
export * from "./domain/dtos/wallet.dto";
export * from "./domain/dtos/wallet-transaction.dto";
export * from "./domain/dtos/payout-request.dto";

// Domain Repositories
export * from "./domain/repositories/wallet.repository.interface";
export * from "./domain/repositories/payout-request.repository.interface";

// Domain Policies & Errors
export * from "./domain/policies";
export * from "./domain/errors";

// Infrastructure Repositories
export * from "./infrastructure/repositories/prisma-wallet.repository";
export * from "./infrastructure/repositories/prisma-payout-request.repository";

// Application Use Cases
export * from "./application/use-cases/get-or-create-wallet.usecase";
export * from "./application/use-cases/get-wallet-transactions.usecase";
export * from "./application/use-cases/create-topup-order.usecase";
export * from "./application/use-cases/verify-topup-payment.usecase";
export * from "./application/use-cases/request-payout.usecase";
export * from "./application/use-cases/get-user-payouts.usecase";
export * from "./application/use-cases/admin-get-all-wallets.usecase";
export * from "./application/use-cases/admin-get-all-payouts.usecase";
export * from "./application/use-cases/admin-process-payout.usecase";
export * from "./application/use-cases/admin-wallet-adjustment.usecase";

// Presentation
export * from "./presentation/schemas/wallet.schema";
export * from "./presentation/controllers";
export * from "./presentation/routes/wallet.routes";

export default walletRouter;
