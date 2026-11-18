import { Request, Response, NextFunction } from "express";
import { GetPlansUseCase } from "../../application/use-cases/get-plans.usecase";
import { AdminManagePlansUseCase } from "../../application/use-cases/admin-manage-plans.usecase";
import { AdminCreatePlanUseCase } from "../../application/use-cases/admin-create-plan.usecase";
import { AdminUpdatePlanUseCase } from "../../application/use-cases/admin-update-plan.usecase";
import { AdminDeletePlanUseCase } from "../../application/use-cases/admin-delete-plan.usecase";
import { AdminGetAllPlansUseCase } from "../../application/use-cases/admin-get-all-plans.usecase";
import { AdminGetAllFeaturesUseCase } from "../../application/use-cases/admin-get-all-features.usecase";
import { GetPlanByIdUseCase } from "../../application/use-cases/get-plan-by-id.usecase";

import { GetPlansController } from "./get-plans.controller";
import { GetPlanByIdController } from "./get-plan-by-id.controller";
import { AdminGetAllPlansController } from "./admin-get-all-plans.controller";
import { AdminGetAllFeaturesController } from "./admin-get-all-features.controller";
import { AdminCreatePlanController } from "./admin-create-plan.controller";
import { AdminUpdatePlanController } from "./admin-update-plan.controller";
import { AdminDeletePlanController } from "./admin-delete-plan.controller";
import { AdminGetPlanByIdController } from "./admin-get-plan-by-id.controller";

export interface PlanControllerDependencies {
  getPlansUseCase: GetPlansUseCase;
  getPlanByIdUseCase?: GetPlanByIdUseCase;
  adminManagePlansUseCase?: AdminManagePlansUseCase;
  adminCreatePlanUseCase?: AdminCreatePlanUseCase;
  adminUpdatePlanUseCase?: AdminUpdatePlanUseCase;
  adminDeletePlanUseCase?: AdminDeletePlanUseCase;
  adminGetAllPlansUseCase?: AdminGetAllPlansUseCase;
  adminGetAllFeaturesUseCase?: AdminGetAllFeaturesUseCase;
}

export class PlanController {
  private readonly getPlansController: GetPlansController;
  private readonly getPlanByIdController: GetPlanByIdController;
  private readonly adminGetAllPlansController: AdminGetAllPlansController;
  private readonly adminGetAllFeaturesController: AdminGetAllFeaturesController;
  private readonly adminCreatePlanController: AdminCreatePlanController;
  private readonly adminUpdatePlanController: AdminUpdatePlanController;
  private readonly adminDeletePlanController: AdminDeletePlanController;
  private readonly adminGetPlanByIdController: AdminGetPlanByIdController;

  constructor(
    depsOrGetPlans: PlanControllerDependencies | GetPlansUseCase,
    adminManagePlansUseCase?: AdminManagePlansUseCase
  ) {
    if ("getPlansUseCase" in depsOrGetPlans) {
      const deps = depsOrGetPlans as PlanControllerDependencies;
      const facade = deps.adminManagePlansUseCase;
      this.getPlansController = new GetPlansController(deps.getPlansUseCase);
      this.getPlanByIdController = new GetPlanByIdController(
        deps.getPlanByIdUseCase || facade!
      );
      this.adminGetAllPlansController = new AdminGetAllPlansController(
        deps.adminGetAllPlansUseCase || facade!
      );
      this.adminGetAllFeaturesController = new AdminGetAllFeaturesController(
        deps.adminGetAllFeaturesUseCase || facade!
      );
      this.adminCreatePlanController = new AdminCreatePlanController(
        deps.adminCreatePlanUseCase || facade!
      );
      this.adminUpdatePlanController = new AdminUpdatePlanController(
        deps.adminUpdatePlanUseCase || facade!
      );
      this.adminDeletePlanController = new AdminDeletePlanController(
        deps.adminDeletePlanUseCase || facade!
      );
      this.adminGetPlanByIdController = new AdminGetPlanByIdController(
        deps.getPlanByIdUseCase || facade!
      );
    } else {
      this.getPlansController = new GetPlansController(depsOrGetPlans);
      this.getPlanByIdController = new GetPlanByIdController(adminManagePlansUseCase!);
      this.adminGetAllPlansController = new AdminGetAllPlansController(adminManagePlansUseCase!);
      this.adminGetAllFeaturesController = new AdminGetAllFeaturesController(adminManagePlansUseCase!);
      this.adminCreatePlanController = new AdminCreatePlanController(adminManagePlansUseCase!);
      this.adminUpdatePlanController = new AdminUpdatePlanController(adminManagePlansUseCase!);
      this.adminDeletePlanController = new AdminDeletePlanController(adminManagePlansUseCase!);
      this.adminGetPlanByIdController = new AdminGetPlanByIdController(adminManagePlansUseCase!);
    }
  }

  getPlans = (req: Request, res: Response, next: NextFunction) =>
    this.getPlansController.execute(req, res, next);

  getPlanById = (req: Request, res: Response, next: NextFunction) =>
    this.getPlanByIdController.execute(req, res, next);

  adminGetAllPlans = (req: Request, res: Response, next: NextFunction) =>
    this.adminGetAllPlansController.execute(req, res, next);

  adminGetAllFeatures = (req: Request, res: Response, next: NextFunction) =>
    this.adminGetAllFeaturesController.execute(req, res, next);

  adminCreatePlan = (req: Request, res: Response, next: NextFunction) =>
    this.adminCreatePlanController.execute(req, res, next);

  adminUpdatePlan = (req: Request, res: Response, next: NextFunction) =>
    this.adminUpdatePlanController.execute(req, res, next);

  adminDeletePlan = (req: Request, res: Response, next: NextFunction) =>
    this.adminDeletePlanController.execute(req, res, next);

  adminGetPlanById = (req: Request, res: Response, next: NextFunction) =>
    this.adminGetPlanByIdController.execute(req, res, next);
}
