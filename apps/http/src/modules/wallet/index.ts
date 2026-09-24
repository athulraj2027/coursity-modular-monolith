import { Router } from "express";
import defaultPrisma from "@/infrastructure/database/prisma.client";
import { RazorpayPaymentService } from "@/infrastructure/payment/services/razorpay-payment.service";
import { PrismaWalletRepository } from "./infrastructure/repositories/prisma-wallet.repository";
import { PrismaPayoutRequestRepository } from "./infrastructure/repositories/prisma-payout-request.repository";
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
import { WalletController } from "./presentation/controllers/wallet.controller";
import { createWalletRouter } from "./presentation/routes/wallet.routes";

export function createWalletModule(
  prisma = defaultPrisma,
  paymentGateway = new RazorpayPaymentService()
) {
  const walletRepo = new PrismaWalletRepository(prisma);
  const payoutRepo = new PrismaPayoutRequestRepository(prisma);

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

  const walletRouter = createWalletRouter(walletController);

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

const defaultModule = createWalletModule();
export const walletRouter: Router = defaultModule.walletRouter;
export default walletRouter;
