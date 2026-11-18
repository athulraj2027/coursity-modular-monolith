import { Request, Response, NextFunction } from "express";
import { CreateTeacherCouponUseCase } from "../../application/use-cases/create-teacher-coupon.usecase";
import { GetTeacherCouponsUseCase } from "../../application/use-cases/get-teacher-coupons.usecase";
import { GetCouponByIdUseCase } from "../../application/use-cases/get-coupon-by-id.usecase";
import { UpdateTeacherCouponUseCase } from "../../application/use-cases/update-teacher-coupon.usecase";
import { DeleteTeacherCouponUseCase } from "../../application/use-cases/delete-teacher-coupon.usecase";
import { ValidateCouponUseCase } from "../../application/use-cases/validate-coupon.usecase";
import { AdminGetCouponsUseCase } from "../../application/use-cases/admin-get-coupons.usecase";
import { AdminToggleCouponStatusUseCase } from "../../application/use-cases/admin-toggle-coupon-status.usecase";
import { AdminDeleteCouponUseCase } from "../../application/use-cases/admin-delete-coupon.usecase";
import { TeacherCouponRepository } from "../../domain/repositories/teacher-coupon.repository";
import { ITeacherProfileResolver } from "../../domain/services/teacher-profile-resolver.service";

import { CreateCouponController } from "./create-coupon.controller";
import { ListMyCouponsController } from "./list-my-coupons.controller";
import { GetCouponByIdController } from "./get-coupon-by-id.controller";
import { UpdateCouponController } from "./update-coupon.controller";
import { DeleteCouponController } from "./delete-coupon.controller";
import { ValidateCouponController } from "./validate-coupon.controller";
import { AdminListCouponsController } from "./admin-list-coupons.controller";
import { AdminToggleCouponStatusController } from "./admin-toggle-coupon-status.controller";
import { AdminDeleteCouponController } from "./admin-delete-coupon.controller";

export interface TeacherCouponControllerDependencies {
  createCouponController?: CreateCouponController;
  listMyCouponsController?: ListMyCouponsController;
  getCouponByIdController?: GetCouponByIdController;
  updateCouponController?: UpdateCouponController;
  deleteCouponController?: DeleteCouponController;
  validateCouponController?: ValidateCouponController;
  adminListCouponsController?: AdminListCouponsController;
  adminToggleCouponStatusController?: AdminToggleCouponStatusController;
  adminDeleteCouponController?: AdminDeleteCouponController;

  createCouponUseCase?: CreateTeacherCouponUseCase;
  getCouponsUseCase?: GetTeacherCouponsUseCase;
  getCouponByIdUseCase?: GetCouponByIdUseCase;
  updateCouponUseCase?: UpdateTeacherCouponUseCase;
  deleteCouponUseCase?: DeleteTeacherCouponUseCase;
  validateCouponUseCase?: ValidateCouponUseCase;
  adminGetCouponsUseCase?: AdminGetCouponsUseCase;
  adminToggleCouponUseCase?: AdminToggleCouponStatusUseCase;
  adminDeleteCouponUseCase?: AdminDeleteCouponUseCase;
  couponRepo?: TeacherCouponRepository;
  profileResolver?: ITeacherProfileResolver;
}

export class TeacherCouponController {
  private readonly createCouponController: CreateCouponController;
  private readonly listMyCouponsController: ListMyCouponsController;
  private readonly getCouponByIdController: GetCouponByIdController;
  private readonly updateCouponController: UpdateCouponController;
  private readonly deleteCouponController: DeleteCouponController;
  private readonly validateCouponController: ValidateCouponController;
  private readonly adminListCouponsController: AdminListCouponsController;
  private readonly adminToggleCouponStatusController: AdminToggleCouponStatusController;
  private readonly adminDeleteCouponController: AdminDeleteCouponController;

  constructor(
    createOrDeps: CreateTeacherCouponUseCase | TeacherCouponControllerDependencies,
    getCouponsUseCase?: GetTeacherCouponsUseCase,
    updateCouponUseCase?: UpdateTeacherCouponUseCase,
    deleteCouponUseCase?: DeleteTeacherCouponUseCase,
    validateCouponUseCase?: ValidateCouponUseCase,
    adminGetCouponsUseCase?: AdminGetCouponsUseCase,
    adminToggleCouponUseCase?: AdminToggleCouponStatusUseCase,
    couponRepo?: TeacherCouponRepository
  ) {
    if (createOrDeps && typeof createOrDeps === "object" && !("execute" in createOrDeps)) {
      const deps = createOrDeps as TeacherCouponControllerDependencies;
      const resolver = deps.profileResolver;

      this.createCouponController =
        deps.createCouponController ??
        new CreateCouponController(deps.createCouponUseCase!, resolver);
      this.listMyCouponsController =
        deps.listMyCouponsController ??
        new ListMyCouponsController(deps.getCouponsUseCase!, resolver);
      this.getCouponByIdController =
        deps.getCouponByIdController ??
        new GetCouponByIdController(
          deps.getCouponByIdUseCase ?? (deps.couponRepo as TeacherCouponRepository),
          resolver
        );
      this.updateCouponController =
        deps.updateCouponController ??
        new UpdateCouponController(deps.updateCouponUseCase!, resolver);
      this.deleteCouponController =
        deps.deleteCouponController ??
        new DeleteCouponController(deps.deleteCouponUseCase!, resolver);
      this.validateCouponController =
        deps.validateCouponController ??
        new ValidateCouponController(deps.validateCouponUseCase!);
      this.adminListCouponsController =
        deps.adminListCouponsController ??
        new AdminListCouponsController(deps.adminGetCouponsUseCase);
      this.adminToggleCouponStatusController =
        deps.adminToggleCouponStatusController ??
        new AdminToggleCouponStatusController(deps.adminToggleCouponUseCase);
      this.adminDeleteCouponController =
        deps.adminDeleteCouponController ??
        new AdminDeleteCouponController(
          deps.adminDeleteCouponUseCase ?? (deps.couponRepo as TeacherCouponRepository)
        );
    } else {
      const createUc = createOrDeps as CreateTeacherCouponUseCase;
      this.createCouponController = new CreateCouponController(createUc);
      this.listMyCouponsController = new ListMyCouponsController(getCouponsUseCase!);
      this.getCouponByIdController = new GetCouponByIdController(couponRepo);
      this.updateCouponController = new UpdateCouponController(updateCouponUseCase!);
      this.deleteCouponController = new DeleteCouponController(deleteCouponUseCase!);
      this.validateCouponController = new ValidateCouponController(validateCouponUseCase!);
      this.adminListCouponsController = new AdminListCouponsController(adminGetCouponsUseCase);
      this.adminToggleCouponStatusController = new AdminToggleCouponStatusController(adminToggleCouponUseCase);
      this.adminDeleteCouponController = new AdminDeleteCouponController(couponRepo);
    }
  }

  create = (req: Request, res: Response, next: NextFunction) =>
    this.createCouponController.execute(req, res, next);

  listMyCoupons = (req: Request, res: Response, next: NextFunction) =>
    this.listMyCouponsController.execute(req, res, next);

  getCouponById = (req: Request, res: Response, next: NextFunction) =>
    this.getCouponByIdController.execute(req, res, next);

  update = (req: Request, res: Response, next: NextFunction) =>
    this.updateCouponController.execute(req, res, next);

  delete = (req: Request, res: Response, next: NextFunction) =>
    this.deleteCouponController.execute(req, res, next);

  validate = (req: Request, res: Response, next: NextFunction) =>
    this.validateCouponController.execute(req, res, next);

  adminListCoupons = (req: Request, res: Response, next: NextFunction) =>
    this.adminListCouponsController.execute(req, res, next);

  adminToggleStatus = (req: Request, res: Response, next: NextFunction) =>
    this.adminToggleCouponStatusController.execute(req, res, next);

  adminDeleteCoupon = (req: Request, res: Response, next: NextFunction) =>
    this.adminDeleteCouponController.execute(req, res, next);
}
