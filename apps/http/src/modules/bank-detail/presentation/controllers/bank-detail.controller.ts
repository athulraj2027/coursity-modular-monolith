import { Request, Response, NextFunction } from "express";
import { CreateBankDetailUseCase } from "../../application/use-cases/create-bank-detail.usecase";
import { GetUserBankDetailsUseCase } from "../../application/use-cases/get-user-bank-details.usecase";
import { GetBankDetailByIdUseCase } from "../../application/use-cases/get-bank-detail-by-id.usecase";
import { SetPrimaryBankDetailUseCase } from "../../application/use-cases/set-primary-bank-detail.usecase";
import { DeleteBankDetailUseCase } from "../../application/use-cases/delete-bank-detail.usecase";
import { AdminGetAllBankDetailsUseCase } from "../../application/use-cases/admin-get-all-bank-details.usecase";
import { AdminGetBankDetailByIdUseCase } from "../../application/use-cases/admin-get-bank-detail-by-id.usecase";
import { AdminUpdateBankVerificationUseCase } from "../../application/use-cases/admin-update-bank-verification.usecase";

import { CreateBankDetailController } from "./create-bank-detail.controller";
import { GetMyBankDetailsController } from "./get-my-bank-details.controller";
import { GetBankDetailByIdController } from "./get-bank-detail-by-id.controller";
import { SetPrimaryBankDetailController } from "./set-primary-bank-detail.controller";
import { DeleteBankDetailController } from "./delete-bank-detail.controller";
import { AdminGetAllBankDetailsController } from "./admin-get-all-bank-details.controller";
import { AdminGetBankDetailByIdController } from "./admin-get-bank-detail-by-id.controller";
import { AdminUpdateBankVerificationController } from "./admin-update-bank-verification.controller";

export interface BankDetailControllerDependencies {
  // Option A: Use cases
  createBankDetailUseCase?: CreateBankDetailUseCase;
  getUserBankDetailsUseCase?: GetUserBankDetailsUseCase;
  getBankDetailByIdUseCase?: GetBankDetailByIdUseCase;
  setPrimaryBankDetailUseCase?: SetPrimaryBankDetailUseCase;
  deleteBankDetailUseCase?: DeleteBankDetailUseCase;
  adminGetAllBankDetailsUseCase?: AdminGetAllBankDetailsUseCase;
  adminGetBankDetailByIdUseCase?: AdminGetBankDetailByIdUseCase;
  adminUpdateBankVerificationUseCase?: AdminUpdateBankVerificationUseCase;

  // Option B: Controllers
  createBankDetailController?: CreateBankDetailController;
  getMyBankDetailsController?: GetMyBankDetailsController;
  getBankDetailByIdController?: GetBankDetailByIdController;
  setPrimaryBankDetailController?: SetPrimaryBankDetailController;
  deleteBankDetailController?: DeleteBankDetailController;
  adminGetAllBankDetailsController?: AdminGetAllBankDetailsController;
  adminGetBankDetailByIdController?: AdminGetBankDetailByIdController;
  adminUpdateBankVerificationController?: AdminUpdateBankVerificationController;
}

export class BankDetailController {
  private readonly createBankDetailController: CreateBankDetailController;
  private readonly getMyBankDetailsController: GetMyBankDetailsController;
  private readonly getBankDetailByIdController: GetBankDetailByIdController;
  private readonly setPrimaryBankDetailController: SetPrimaryBankDetailController;
  private readonly deleteBankDetailController: DeleteBankDetailController;
  private readonly adminGetAllBankDetailsController: AdminGetAllBankDetailsController;
  private readonly adminGetBankDetailByIdController: AdminGetBankDetailByIdController;
  private readonly adminUpdateBankVerificationController: AdminUpdateBankVerificationController;

  constructor(
    createOrDeps: CreateBankDetailUseCase | BankDetailControllerDependencies,
    getUserBankDetailsUseCase?: GetUserBankDetailsUseCase,
    setPrimaryBankDetailUseCase?: SetPrimaryBankDetailUseCase,
    deleteBankDetailUseCase?: DeleteBankDetailUseCase,
    adminGetAllBankDetailsUseCase?: AdminGetAllBankDetailsUseCase,
    adminGetBankDetailByIdUseCase?: AdminGetBankDetailByIdUseCase,
    adminUpdateBankVerificationUseCase?: AdminUpdateBankVerificationUseCase,
    getBankDetailByIdUseCase?: GetBankDetailByIdUseCase
  ) {
    if (createOrDeps && typeof createOrDeps === "object" && !("execute" in createOrDeps)) {
      const deps = createOrDeps as BankDetailControllerDependencies;
      this.createBankDetailController =
        deps.createBankDetailController ??
        new CreateBankDetailController(deps.createBankDetailUseCase!);
      this.getMyBankDetailsController =
        deps.getMyBankDetailsController ??
        new GetMyBankDetailsController(deps.getUserBankDetailsUseCase!);
      this.getBankDetailByIdController =
        deps.getBankDetailByIdController ??
        new GetBankDetailByIdController(deps.getBankDetailByIdUseCase!);
      this.setPrimaryBankDetailController =
        deps.setPrimaryBankDetailController ??
        new SetPrimaryBankDetailController(deps.setPrimaryBankDetailUseCase!);
      this.deleteBankDetailController =
        deps.deleteBankDetailController ??
        new DeleteBankDetailController(deps.deleteBankDetailUseCase!);
      this.adminGetAllBankDetailsController =
        deps.adminGetAllBankDetailsController ??
        new AdminGetAllBankDetailsController(deps.adminGetAllBankDetailsUseCase!);
      this.adminGetBankDetailByIdController =
        deps.adminGetBankDetailByIdController ??
        new AdminGetBankDetailByIdController(deps.adminGetBankDetailByIdUseCase!);
      this.adminUpdateBankVerificationController =
        deps.adminUpdateBankVerificationController ??
        new AdminUpdateBankVerificationController(deps.adminUpdateBankVerificationUseCase!);
    } else {
      const createUc = createOrDeps as CreateBankDetailUseCase;
      this.createBankDetailController = new CreateBankDetailController(createUc);
      this.getMyBankDetailsController = new GetMyBankDetailsController(getUserBankDetailsUseCase!);
      this.setPrimaryBankDetailController = new SetPrimaryBankDetailController(setPrimaryBankDetailUseCase!);
      this.deleteBankDetailController = new DeleteBankDetailController(deleteBankDetailUseCase!);
      this.adminGetAllBankDetailsController = new AdminGetAllBankDetailsController(adminGetAllBankDetailsUseCase!);
      this.adminGetBankDetailByIdController = new AdminGetBankDetailByIdController(adminGetBankDetailByIdUseCase!);
      this.adminUpdateBankVerificationController = new AdminUpdateBankVerificationController(adminUpdateBankVerificationUseCase!);
      
      const getByIdUc = getBankDetailByIdUseCase || new GetBankDetailByIdUseCase({
        findById: (id: string) => adminGetBankDetailByIdUseCase!.execute(id),
      } as any);
      this.getBankDetailByIdController = new GetBankDetailByIdController(getByIdUc);
    }
  }

  createBankDetail = (req: Request, res: Response, next: NextFunction) =>
    this.createBankDetailController.execute(req, res, next);

  getMyBankDetails = (req: Request, res: Response, next: NextFunction) =>
    this.getMyBankDetailsController.execute(req, res, next);

  getById = (req: Request, res: Response, next: NextFunction) =>
    this.getBankDetailByIdController.execute(req, res, next);

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
