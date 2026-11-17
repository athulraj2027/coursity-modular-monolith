import { Request, Response, NextFunction } from "express";
import { GetPlanOfferUseCase } from "../../application/use-cases/get-plan-offer.usecase";
import { GetActiveOffersUseCase } from "../../application/use-cases/get-active-offers.usecase";
import { AdminCreateOfferUseCase } from "../../application/use-cases/admin-create-offer.usecase";
import { AdminUpdateOfferUseCase } from "../../application/use-cases/admin-update-offer.usecase";
import { AdminListOffersUseCase } from "../../application/use-cases/admin-list-offers.usecase";
import { AdminToggleOfferUseCase } from "../../application/use-cases/admin-toggle-offer.usecase";
import { AdminDeleteOfferUseCase } from "../../application/use-cases/admin-delete-offer.usecase";
import { AdminGetOfferAnalyticsUseCase } from "../../application/use-cases/admin-get-offer-analytics.usecase";

import { GetPlanOfferController } from "./get-plan-offer.controller";
import { GetActiveOffersController } from "./get-active-offers.controller";
import { AdminListOffersController } from "./admin-list-offers.controller";
import { AdminCreateOfferController } from "./admin-create-offer.controller";
import { AdminUpdateOfferController } from "./admin-update-offer.controller";
import { AdminToggleOfferController } from "./admin-toggle-offer.controller";
import { AdminDeleteOfferController } from "./admin-delete-offer.controller";
import { AdminGetOfferAnalyticsController } from "./admin-get-offer-analytics.controller";
import {
  ITeacherProfileResolver,
  defaultTeacherProfileResolver,
} from "@/modules/course/domain/services/teacher-profile-resolver.service";

export interface OfferControllerDependencies {
  getPlanOfferUseCase: GetPlanOfferUseCase;
  getActiveOffersUseCase: GetActiveOffersUseCase;
  adminCreateOfferUseCase: AdminCreateOfferUseCase;
  adminUpdateOfferUseCase: AdminUpdateOfferUseCase;
  adminListOffersUseCase: AdminListOffersUseCase;
  adminToggleOfferUseCase: AdminToggleOfferUseCase;
  adminDeleteOfferUseCase: AdminDeleteOfferUseCase;
  adminGetOfferAnalyticsUseCase: AdminGetOfferAnalyticsUseCase;
  profileResolver?: ITeacherProfileResolver;
}

export class OfferController {
  private readonly getPlanOfferController: GetPlanOfferController;
  private readonly getActiveOffersController: GetActiveOffersController;
  private readonly adminListOffersController: AdminListOffersController;
  private readonly adminCreateOfferController: AdminCreateOfferController;
  private readonly adminUpdateOfferController: AdminUpdateOfferController;
  private readonly adminToggleOfferController: AdminToggleOfferController;
  private readonly adminDeleteOfferController: AdminDeleteOfferController;
  private readonly adminGetOfferAnalyticsController: AdminGetOfferAnalyticsController;

  constructor(
    depsOrFirstUseCase: OfferControllerDependencies | GetPlanOfferUseCase,
    getActiveOffersUseCase?: GetActiveOffersUseCase,
    adminCreateOfferUseCase?: AdminCreateOfferUseCase,
    adminUpdateOfferUseCase?: AdminUpdateOfferUseCase,
    adminListOffersUseCase?: AdminListOffersUseCase,
    adminToggleOfferUseCase?: AdminToggleOfferUseCase,
    adminDeleteOfferUseCase?: AdminDeleteOfferUseCase,
    adminGetOfferAnalyticsUseCase?: AdminGetOfferAnalyticsUseCase,
    profileResolver: ITeacherProfileResolver = defaultTeacherProfileResolver
  ) {
    if ("getPlanOfferUseCase" in depsOrFirstUseCase) {
      const deps = depsOrFirstUseCase as OfferControllerDependencies;
      const resolver = deps.profileResolver || defaultTeacherProfileResolver;
      this.getPlanOfferController = new GetPlanOfferController(deps.getPlanOfferUseCase, resolver);
      this.getActiveOffersController = new GetActiveOffersController(deps.getActiveOffersUseCase);
      this.adminListOffersController = new AdminListOffersController(deps.adminListOffersUseCase);
      this.adminCreateOfferController = new AdminCreateOfferController(deps.adminCreateOfferUseCase);
      this.adminUpdateOfferController = new AdminUpdateOfferController(deps.adminUpdateOfferUseCase);
      this.adminToggleOfferController = new AdminToggleOfferController(deps.adminToggleOfferUseCase);
      this.adminDeleteOfferController = new AdminDeleteOfferController(deps.adminDeleteOfferUseCase);
      this.adminGetOfferAnalyticsController = new AdminGetOfferAnalyticsController(deps.adminGetOfferAnalyticsUseCase);
    } else {
      this.getPlanOfferController = new GetPlanOfferController(depsOrFirstUseCase, profileResolver);
      this.getActiveOffersController = new GetActiveOffersController(getActiveOffersUseCase!);
      this.adminListOffersController = new AdminListOffersController(adminListOffersUseCase!);
      this.adminCreateOfferController = new AdminCreateOfferController(adminCreateOfferUseCase!);
      this.adminUpdateOfferController = new AdminUpdateOfferController(adminUpdateOfferUseCase!);
      this.adminToggleOfferController = new AdminToggleOfferController(adminToggleOfferUseCase!);
      this.adminDeleteOfferController = new AdminDeleteOfferController(adminDeleteOfferUseCase!);
      this.adminGetOfferAnalyticsController = new AdminGetOfferAnalyticsController(adminGetOfferAnalyticsUseCase!);
    }
  }

  getPlanOffer = (req: Request, res: Response, next: NextFunction) =>
    this.getPlanOfferController.execute(req, res, next);

  getActiveOffers = (req: Request, res: Response, next: NextFunction) =>
    this.getActiveOffersController.execute(req, res, next);

  adminListOffers = (req: Request, res: Response, next: NextFunction) =>
    this.adminListOffersController.execute(req, res, next);

  adminCreateOffer = (req: Request, res: Response, next: NextFunction) =>
    this.adminCreateOfferController.execute(req, res, next);

  adminUpdateOffer = (req: Request, res: Response, next: NextFunction) =>
    this.adminUpdateOfferController.execute(req, res, next);

  adminToggleOffer = (req: Request, res: Response, next: NextFunction) =>
    this.adminToggleOfferController.execute(req, res, next);

  adminDeleteOffer = (req: Request, res: Response, next: NextFunction) =>
    this.adminDeleteOfferController.execute(req, res, next);

  adminGetAnalytics = (req: Request, res: Response, next: NextFunction) =>
    this.adminGetOfferAnalyticsController.execute(req, res, next);
}
