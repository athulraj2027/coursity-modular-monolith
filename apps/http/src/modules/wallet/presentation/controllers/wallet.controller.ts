import { Request, Response, NextFunction } from "express";
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
import { UnauthorizedError } from "@/app/errors";

export class WalletController {
  constructor(
    private readonly getOrCreateWalletUseCase: GetOrCreateWalletUseCase,
    private readonly getWalletTransactionsUseCase: GetWalletTransactionsUseCase,
    private readonly createTopUpOrderUseCase: CreateTopUpOrderUseCase,
    private readonly verifyTopUpPaymentUseCase: VerifyTopUpPaymentUseCase,
    private readonly requestPayoutUseCase: RequestPayoutUseCase,
    private readonly getUserPayoutsUseCase: GetUserPayoutsUseCase,
    private readonly adminGetAllWalletsUseCase: AdminGetAllWalletsUseCase,
    private readonly adminGetAllPayoutsUseCase: AdminGetAllPayoutsUseCase,
    private readonly adminProcessPayoutUseCase: AdminProcessPayoutUseCase,
    private readonly adminWalletAdjustmentUseCase: AdminWalletAdjustmentUseCase
  ) {}

  private getUserId(req: Request): string {
    const userId = req.user?.userId;
    if (!userId) {
      throw new UnauthorizedError("Authentication required. Please sign in.");
    }
    return userId;
  }

  /**
   * GET /api/wallet/my
   */
  getMyWallet = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = this.getUserId(req);
      const wallet = await this.getOrCreateWalletUseCase.execute(userId);

      return res.status(200).json({
        success: true,
        data: wallet,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/wallet/transactions
   */
  getMyTransactions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = this.getUserId(req);
      const { page, limit, type, direction, status, startDate, endDate } = req.query as any;

      const result = await this.getWalletTransactionsUseCase.execute({
        userId,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 15,
        type: type as any,
        direction: direction as any,
        status: status as any,
        startDate: startDate ? String(startDate) : undefined,
        endDate: endDate ? String(endDate) : undefined,
      });

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/wallet/topup/create-order
   */
  createTopUpOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = this.getUserId(req);
      const { amount } = req.body;

      const order = await this.createTopUpOrderUseCase.execute({
        userId,
        amount: Number(amount),
      });

      return res.status(200).json({
        success: true,
        data: order,
        message: "Razorpay top-up order generated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/wallet/topup/verify
   */
  verifyTopUpPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = this.getUserId(req);
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

      const result = await this.verifyTopUpPaymentUseCase.execute({
        userId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      });

      return res.status(200).json({
        success: true,
        data: result,
        message: "Wallet topped up successfully!",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/wallet/payouts/request
   */
  requestPayout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = this.getUserId(req);
      const { amount, bankDetailId } = req.body;

      const payout = await this.requestPayoutUseCase.execute({
        userId,
        amount: Number(amount),
        bankDetailId: bankDetailId ? String(bankDetailId) : undefined,
      });

      return res.status(201).json({
        success: true,
        data: payout,
        message: "Payout withdrawal request submitted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/wallet/payouts/my
   */
  getMyPayouts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = this.getUserId(req);
      const { page, limit, status } = req.query as any;

      const result = await this.getUserPayoutsUseCase.execute({
        userId,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
        status: status as any,
      });

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  // ==========================================
  // ADMIN CONTROLLERS
  // ==========================================

  /**
   * GET /api/wallet/admin/wallets
   */
  adminGetAllWallets = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, search, status } = req.query as any;

      const result = await this.adminGetAllWalletsUseCase.execute({
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
        search: search ? String(search) : undefined,
        status: status as any,
      });

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/wallet/admin/payouts
   */
  adminGetAllPayouts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, search, status, userId } = req.query as any;

      const result = await this.adminGetAllPayoutsUseCase.execute({
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
        search: search ? String(search) : undefined,
        status: status as any,
        userId: userId ? String(userId) : undefined,
      });

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/wallet/admin/payouts/:id
   */
  adminProcessPayout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminUserId = this.getUserId(req);
      const id = String(req.params.id);
      const { status, rejectionReason, transactionRef } = req.body;

      const result = await this.adminProcessPayoutUseCase.execute({
        id,
        status,
        processedByUserId: adminUserId,
        rejectionReason,
        transactionRef,
      });

      return res.status(200).json({
        success: true,
        data: result,
        message: `Payout request marked as ${status.toLowerCase()}`,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/wallet/admin/adjustment
   */
  adminWalletAdjustment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminUserId = this.getUserId(req);
      const { userId, amount, direction, reason } = req.body;

      const result = await this.adminWalletAdjustmentUseCase.execute({
        userId,
        amount: Number(amount),
        direction,
        reason,
        performedByUserId: adminUserId,
      });

      return res.status(200).json({
        success: true,
        data: result,
        message: `Wallet ${direction === "CREDIT" ? "credited" : "debited"} successfully by administration`,
      });
    } catch (error) {
      next(error);
    }
  };
}
