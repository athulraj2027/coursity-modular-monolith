import { GetOrCreateWalletUseCase } from "../../application/use-cases/get-or-create-wallet.usecase";
import { GetWalletTransactionsUseCase } from "../../application/use-cases/get-wallet-transactions.usecase";
import { CreateTopUpOrderUseCase } from "../../application/use-cases/create-topup-order.usecase";
import { VerifyTopUpPaymentUseCase } from "../../application/use-cases/verify-topup-payment.usecase";
import { RequestPayoutUseCase } from "../../application/use-cases/request-payout.usecase";
import { GetUserPayoutsUseCase } from "../../application/use-cases/get-user-payouts.usecase";
import { AdminGetAllWalletsUseCase } from "../../application/use-cases/admin-get-all-wallets.usecase";
import { AdminGetAllPayoutsUseCase } from "../../application/use-cases/admin-get-all-payouts.usecase";
import { AdminProcessPayoutUseCase } from "../../application/use-cases/admin-process-payout.usecase";
import { AdminWalletAdjustmentUseCase } from "../../application/use-cases/admin-wallet-adjustment.usecase";

import { GetMyWalletController } from "./get-my-wallet.controller";
import { GetMyTransactionsController } from "./get-my-transactions.controller";
import { CreateTopUpOrderController } from "./create-topup-order.controller";
import { VerifyTopUpPaymentController } from "./verify-topup-payment.controller";
import { RequestPayoutController } from "./request-payout.controller";
import { GetMyPayoutsController } from "./get-my-payouts.controller";
import { AdminGetAllWalletsController } from "./admin-get-all-wallets.controller";
import { AdminGetAllPayoutsController } from "./admin-get-all-payouts.controller";
import { AdminProcessPayoutController } from "./admin-process-payout.controller";
import { AdminWalletAdjustmentController } from "./admin-wallet-adjustment.controller";

export class WalletController {
  public readonly getMyWalletController: GetMyWalletController;
  public readonly getMyTransactionsController: GetMyTransactionsController;
  public readonly createTopUpOrderController: CreateTopUpOrderController;
  public readonly verifyTopUpPaymentController: VerifyTopUpPaymentController;
  public readonly requestPayoutController: RequestPayoutController;
  public readonly getMyPayoutsController: GetMyPayoutsController;
  public readonly adminGetAllWalletsController: AdminGetAllWalletsController;
  public readonly adminGetAllPayoutsController: AdminGetAllPayoutsController;
  public readonly adminProcessPayoutController: AdminProcessPayoutController;
  public readonly adminWalletAdjustmentController: AdminWalletAdjustmentController;

  constructor(
    getOrCreateWalletUseCase: GetOrCreateWalletUseCase,
    getWalletTransactionsUseCase: GetWalletTransactionsUseCase,
    createTopUpOrderUseCase: CreateTopUpOrderUseCase,
    verifyTopUpPaymentUseCase: VerifyTopUpPaymentUseCase,
    requestPayoutUseCase: RequestPayoutUseCase,
    getUserPayoutsUseCase: GetUserPayoutsUseCase,
    adminGetAllWalletsUseCase: AdminGetAllWalletsUseCase,
    adminGetAllPayoutsUseCase: AdminGetAllPayoutsUseCase,
    adminProcessPayoutUseCase: AdminProcessPayoutUseCase,
    adminWalletAdjustmentUseCase: AdminWalletAdjustmentUseCase
  ) {
    this.getMyWalletController = new GetMyWalletController(getOrCreateWalletUseCase);
    this.getMyTransactionsController = new GetMyTransactionsController(getWalletTransactionsUseCase);
    this.createTopUpOrderController = new CreateTopUpOrderController(createTopUpOrderUseCase);
    this.verifyTopUpPaymentController = new VerifyTopUpPaymentController(verifyTopUpPaymentUseCase);
    this.requestPayoutController = new RequestPayoutController(requestPayoutUseCase);
    this.getMyPayoutsController = new GetMyPayoutsController(getUserPayoutsUseCase);
    this.adminGetAllWalletsController = new AdminGetAllWalletsController(adminGetAllWalletsUseCase);
    this.adminGetAllPayoutsController = new AdminGetAllPayoutsController(adminGetAllPayoutsUseCase);
    this.adminProcessPayoutController = new AdminProcessPayoutController(adminProcessPayoutUseCase);
    this.adminWalletAdjustmentController = new AdminWalletAdjustmentController(adminWalletAdjustmentUseCase);
  }

  getMyWallet = (req: any, res: any, next: any) => this.getMyWalletController.execute(req, res, next);
  getMyTransactions = (req: any, res: any, next: any) => this.getMyTransactionsController.execute(req, res, next);
  createTopUpOrder = (req: any, res: any, next: any) => this.createTopUpOrderController.execute(req, res, next);
  verifyTopUpPayment = (req: any, res: any, next: any) => this.verifyTopUpPaymentController.execute(req, res, next);
  requestPayout = (req: any, res: any, next: any) => this.requestPayoutController.execute(req, res, next);
  getMyPayouts = (req: any, res: any, next: any) => this.getMyPayoutsController.execute(req, res, next);
  adminGetAllWallets = (req: any, res: any, next: any) => this.adminGetAllWalletsController.execute(req, res, next);
  adminGetAllPayouts = (req: any, res: any, next: any) => this.adminGetAllPayoutsController.execute(req, res, next);
  adminProcessPayout = (req: any, res: any, next: any) => this.adminProcessPayoutController.execute(req, res, next);
  adminWalletAdjustment = (req: any, res: any, next: any) => this.adminWalletAdjustmentController.execute(req, res, next);
}
