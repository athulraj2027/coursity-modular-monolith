import { Request, Response, NextFunction } from "express";
import { CreateBankDetailUseCase } from "../../application/use-cases/create-bank-detail.usecase";
import { GetUserBankDetailsUseCase } from "../../application/use-cases/get-user-bank-details.usecase";
import { SetPrimaryBankDetailUseCase } from "../../application/use-cases/set-primary-bank-detail.usecase";
import { DeleteBankDetailUseCase } from "../../application/use-cases/delete-bank-detail.usecase";
import { AdminGetAllBankDetailsUseCase } from "../../application/use-cases/admin-get-all-bank-details.usecase";
import { AdminGetBankDetailByIdUseCase } from "../../application/use-cases/admin-get-bank-detail-by-id.usecase";
import { AdminUpdateBankVerificationUseCase } from "../../application/use-cases/admin-update-bank-verification.usecase";

import { CreateBankDetailController } from "./create-bank-detail.controller";
import { GetMyBankDetailsController } from "./get-my-bank-details.controller";
import { SetPrimaryBankDetailController } from "./set-primary-bank-detail.controller";
import { DeleteBankDetailController } from "./delete-bank-detail.controller";
import { AdminGetAllBankDetailsController } from "./admin-get-all-bank-details.controller";
import { AdminGetBankDetailByIdController } from "./admin-get-bank-detail-by-id.controller";
import { AdminUpdateBankVerificationController } from "./admin-update-bank-verification.controller";

export class BankDetailController {
  private readonly createBankDetailController: CreateBankDetailController;
  private readonly getMyBankDetailsController: GetMyBankDetailsController;
  private readonly setPrimaryBankDetailController: SetPrimaryBankDetailController;
  private readonly deleteBankDetailController: DeleteBankDetailController;
  private readonly adminGetAllBankDetailsController: AdminGetAllBankDetailsController;
  private readonly adminGetBankDetailByIdController: AdminGetBankDetailByIdController;
  private readonly adminUpdateBankVerificationController: AdminUpdateBankVerificationController;

  constructor(
    private readonly createBankDetailUseCase: CreateBankDetailUseCase,
    private readonly getUserBankDetailsUseCase: GetUserBankDetailsUseCase,
    private readonly setPrimaryBankDetailUseCase: SetPrimaryBankDetailUseCase,
    private readonly deleteBankDetailUseCase: DeleteBankDetailUseCase,
    private readonly adminGetAllBankDetailsUseCase: AdminGetAllBankDetailsUseCase,
    private readonly adminGetBankDetailByIdUseCase: AdminGetBankDetailByIdUseCase,
    private readonly adminUpdateBankVerificationUseCase: AdminUpdateBankVerificationUseCase
  ) {
    this.createBankDetailController = new CreateBankDetailController(createBankDetailUseCase);
    this.getMyBankDetailsController = new GetMyBankDetailsController(getUserBankDetailsUseCase);
    this.setPrimaryBankDetailController = new SetPrimaryBankDetailController(setPrimaryBankDetailUseCase);
    this.deleteBankDetailController = new DeleteBankDetailController(deleteBankDetailUseCase);
    this.adminGetAllBankDetailsController = new AdminGetAllBankDetailsController(adminGetAllBankDetailsUseCase);
    this.adminGetBankDetailByIdController = new AdminGetBankDetailByIdController(adminGetBankDetailByIdUseCase);
    this.adminUpdateBankVerificationController = new AdminUpdateBankVerificationController(adminUpdateBankVerificationUseCase);
  }

  createBankDetail = (req: Request, res: Response, next: NextFunction) =>
    this.createBankDetailController.execute(req, res, next);

  getMyBankDetails = (req: Request, res: Response, next: NextFunction) =>
    this.getMyBankDetailsController.execute(req, res, next);

  setPrimary = (req: Request, res: Response, next: NextFunction) =>
    this.setPrimaryBankDetailController.execute(req, res, next);

  deleteBankDetail = (req: Request, res: Response, next: NextFunction) =>
    this.deleteBankDetailController.execute(req, res, next);

  adminGetAll = (req: Request, res: Response, next: NextFunction) =>
    this.adminGetAllBankDetailsController.execute(req, res, next);

  adminGetById = (req: Request, res: Response, next: NextFunction) =>
    this.adminGetBankDetailByIdController.execute(req, res, next);

  adminUpdateVerification = (req: Request, res: Response, next: NextFunction) =>
    this.adminUpdateBankVerificationController.execute(req, res, next);
}
