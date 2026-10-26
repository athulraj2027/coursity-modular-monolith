import { GetPlansUseCase } from "../../application/use-cases/get-plans.usecase";
import { AdminManagePlansUseCase } from "../../application/use-cases/admin-manage-plans.usecase";

import { GetPlansController } from "./get-plans.controller";
import { GetPlanByIdController } from "./get-plan-by-id.controller";
import { AdminGetAllPlansController } from "./admin-get-all-plans.controller";
import { AdminGetAllFeaturesController } from "./admin-get-all-features.controller";
import { AdminGetPlanByIdController } from "./admin-get-plan-by-id.controller";
import { AdminCreatePlanController } from "./admin-create-plan.controller";
import { AdminUpdatePlanController } from "./admin-update-plan.controller";
import { AdminDeletePlanController } from "./admin-delete-plan.controller";

export class PlanController {
  public readonly getPlansController: GetPlansController;
  public readonly getPlanByIdController: GetPlanByIdController;
  public readonly adminGetAllPlansController: AdminGetAllPlansController;
  public readonly adminGetAllFeaturesController: AdminGetAllFeaturesController;
  public readonly adminGetPlanByIdController: AdminGetPlanByIdController;
  public readonly adminCreatePlanController: AdminCreatePlanController;
  public readonly adminUpdatePlanController: AdminUpdatePlanController;
  public readonly adminDeletePlanController: AdminDeletePlanController;

  constructor(
    getPlansUseCase: GetPlansUseCase,
    adminManagePlansUseCase: AdminManagePlansUseCase
  ) {
    this.getPlansController = new GetPlansController(getPlansUseCase);
    this.getPlanByIdController = new GetPlanByIdController(adminManagePlansUseCase);
    this.adminGetAllPlansController = new AdminGetAllPlansController(adminManagePlansUseCase);
    this.adminGetAllFeaturesController = new AdminGetAllFeaturesController(adminManagePlansUseCase);
    this.adminGetPlanByIdController = new AdminGetPlanByIdController(adminManagePlansUseCase);
    this.adminCreatePlanController = new AdminCreatePlanController(adminManagePlansUseCase);
    this.adminUpdatePlanController = new AdminUpdatePlanController(adminManagePlansUseCase);
    this.adminDeletePlanController = new AdminDeletePlanController(adminManagePlansUseCase);
  }

  getPlans = (req: any, res: any, next: any) => this.getPlansController.execute(req, res, next);
  getPlanById = (req: any, res: any, next: any) => this.getPlanByIdController.execute(req, res, next);
  adminGetAllPlans = (req: any, res: any, next: any) => this.adminGetAllPlansController.execute(req, res, next);
  adminGetAllFeatures = (req: any, res: any, next: any) => this.adminGetAllFeaturesController.execute(req, res, next);
  adminGetPlanById = (req: any, res: any, next: any) => this.adminGetPlanByIdController.execute(req, res, next);
  adminCreatePlan = (req: any, res: any, next: any) => this.adminCreatePlanController.execute(req, res, next);
  adminUpdatePlan = (req: any, res: any, next: any) => this.adminUpdatePlanController.execute(req, res, next);
  adminDeletePlan = (req: any, res: any, next: any) => this.adminDeletePlanController.execute(req, res, next);
}
