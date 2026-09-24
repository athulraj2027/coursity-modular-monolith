import { Request, Response, NextFunction } from "express";
import { CreateBankDetailUseCase } from "../../application/use-cases/create-bank-detail.usecase";
import { GetUserBankDetailsUseCase } from "../../application/use-cases/get-user-bank-details.usecase";
import { SetPrimaryBankDetailUseCase } from "../../application/use-cases/set-primary-bank-detail.usecase";
import { DeleteBankDetailUseCase } from "../../application/use-cases/delete-bank-detail.usecase";
import { AdminGetAllBankDetailsUseCase } from "../../application/use-cases/admin-get-all-bank-details.usecase";
import { AdminGetBankDetailByIdUseCase } from "../../application/use-cases/admin-get-bank-detail-by-id.usecase";
import { AdminUpdateBankVerificationUseCase } from "../../application/use-cases/admin-update-bank-verification.usecase";
import { UnauthorizedError } from "@/app/errors";

export class BankDetailController {
  constructor(
    private readonly createBankDetailUseCase: CreateBankDetailUseCase,
    private readonly getUserBankDetailsUseCase: GetUserBankDetailsUseCase,
    private readonly setPrimaryBankDetailUseCase: SetPrimaryBankDetailUseCase,
    private readonly deleteBankDetailUseCase: DeleteBankDetailUseCase,
    private readonly adminGetAllBankDetailsUseCase: AdminGetAllBankDetailsUseCase,
    private readonly adminGetBankDetailByIdUseCase: AdminGetBankDetailByIdUseCase,
    private readonly adminUpdateBankVerificationUseCase: AdminUpdateBankVerificationUseCase
  ) {}

  private getUserId(req: Request): string {
    const userId = req.user?.userId;
    if (!userId) {
      throw new UnauthorizedError("Authentication required. Please sign in.");
    }
    return userId;
  }

  /**
   * POST /api/bank-details
   * Adds a new bank account or UPI ID for the logged-in user
   */
  createBankDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = this.getUserId(req);
      const result = await this.createBankDetailUseCase.execute({
        ...req.body,
        userId,
      });

      return res.status(201).json({
        success: true,
        data: result,
        message: "Bank details saved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/bank-details
   * Retrieves all bank accounts and UPI IDs for the logged-in user
   */
  getMyBankDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = this.getUserId(req);
      const items = await this.getUserBankDetailsUseCase.execute(userId);

      return res.status(200).json({
        success: true,
        data: items,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/bank-details/:id/primary
   * Sets a specific bank account as primary for payouts
   */
  setPrimary = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = this.getUserId(req);
      const id = String(req.params.id);

      const result = await this.setPrimaryBankDetailUseCase.execute(id, userId);

      return res.status(200).json({
        success: true,
        data: result,
        message: "Primary payout account updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/bank-details/:id
   * Removes a bank account from the user's profile
   */
  deleteBankDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = this.getUserId(req);
      const id = String(req.params.id);

      const result = await this.deleteBankDetailUseCase.execute(id, userId);

      return res.status(200).json({
        success: true,
        data: result,
        message: "Bank account removed successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  // ==========================================
  // ADMIN CONTROLLERS
  // ==========================================

  /**
   * GET /api/bank-details/admin/all
   * Admin paginated view of all registered bank accounts across users
   */
  adminGetAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, search, status, methodType, userId } = req.query as any;

      const result = await this.adminGetAllBankDetailsUseCase.execute({
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
        search: search ? String(search) : undefined,
        status: status as any,
        methodType: methodType as any,
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
   * GET /api/bank-details/admin/:id
   * Admin view single bank detail with user details
   */
  adminGetById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = String(req.params.id);
      const result = await this.adminGetBankDetailByIdUseCase.execute(id);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/bank-details/admin/:id/verification
   * Admin update verification status (VERIFIED, REJECTED, etc.)
   */
  adminUpdateVerification = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = String(req.params.id);
      const { status, notes } = req.body;

      const result = await this.adminUpdateBankVerificationUseCase.execute({
        id,
        status,
        notes,
      });

      return res.status(200).json({
        success: true,
        data: result,
        message: `Bank account verification status updated to ${status}`,
      });
    } catch (error) {
      next(error);
    }
  };
}
