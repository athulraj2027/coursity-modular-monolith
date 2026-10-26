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
    private readonly getPlanOfferUseCase: GetPlanOfferUseCase,
    private readonly getActiveOffersUseCase: GetActiveOffersUseCase,
    private readonly adminCreateOfferUseCase: AdminCreateOfferUseCase,
    private readonly adminUpdateOfferUseCase: AdminUpdateOfferUseCase,
    private readonly adminListOffersUseCase: AdminListOffersUseCase,
    private readonly adminToggleOfferUseCase: AdminToggleOfferUseCase,
    private readonly adminDeleteOfferUseCase: AdminDeleteOfferUseCase,
    private readonly adminGetOfferAnalyticsUseCase: AdminGetOfferAnalyticsUseCase
  ) {
    this.getPlanOfferController = new GetPlanOfferController(getPlanOfferUseCase);
    this.getActiveOffersController = new GetActiveOffersController(getActiveOffersUseCase);
    this.adminListOffersController = new AdminListOffersController(adminListOffersUseCase);
    this.adminCreateOfferController = new AdminCreateOfferController(adminCreateOfferUseCase);
    this.adminUpdateOfferController = new AdminUpdateOfferController(adminUpdateOfferUseCase);
    this.adminToggleOfferController = new AdminToggleOfferController(adminToggleOfferUseCase);
    this.adminDeleteOfferController = new AdminDeleteOfferController(adminDeleteOfferUseCase);
    this.adminGetOfferAnalyticsController = new AdminGetOfferAnalyticsController(adminGetOfferAnalyticsUseCase);
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
