import { Request, Response, NextFunction } from "express";
import { GetPlanOfferUseCase } from "../../application/use-cases/get-plan-offer.usecase";
import { GetActiveOffersUseCase } from "../../application/use-cases/get-active-offers.usecase";
import { AdminCreateOfferUseCase } from "../../application/use-cases/admin-create-offer.usecase";
import { AdminUpdateOfferUseCase } from "../../application/use-cases/admin-update-offer.usecase";
import { AdminListOffersUseCase } from "../../application/use-cases/admin-list-offers.usecase";
import { AdminToggleOfferUseCase } from "../../application/use-cases/admin-toggle-offer.usecase";
import { AdminDeleteOfferUseCase } from "../../application/use-cases/admin-delete-offer.usecase";
import { AdminGetOfferAnalyticsUseCase } from "../../application/use-cases/admin-get-offer-analytics.usecase";
import defaultPrisma from "@/infrastructure/database/prisma.client";

export class OfferController {
  constructor(
    private readonly getPlanOfferUseCase: GetPlanOfferUseCase,
    private readonly getActiveOffersUseCase: GetActiveOffersUseCase,
    private readonly adminCreateOfferUseCase: AdminCreateOfferUseCase,
    private readonly adminUpdateOfferUseCase: AdminUpdateOfferUseCase,
    private readonly adminListOffersUseCase: AdminListOffersUseCase,
    private readonly adminToggleOfferUseCase: AdminToggleOfferUseCase,
    private readonly adminDeleteOfferUseCase: AdminDeleteOfferUseCase,
    private readonly adminGetOfferAnalyticsUseCase: AdminGetOfferAnalyticsUseCase
  ) {}

  private async getTeacherProfileId(userId?: string): Promise<string | null> {
    if (!userId) return null;
    const profile = await defaultPrisma.profile.findUnique({
      where: { userId },
      include: { teacherProfile: true },
    });
    return profile?.teacherProfile?.id || null;
  }

  /**
   * GET /api/offers/plan-offer
   * Resolves active default promotional offer and price breakdown for a plan and billing cycle
   */
  getPlanOffer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { planId, billingCycle, offerId } = req.query as {
        planId: string;
        billingCycle?: any;
        offerId?: string;
      };
      const teacherProfileId = (await this.getTeacherProfileId(req.user?.userId)) || undefined;

      const result = await this.getPlanOfferUseCase.execute({
        planId,
        billingCycle,
        teacherProfileId,
        offerId,
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
   * GET /api/offers/active
   * Retrieve all active promotional campaign offers
   */
  getActiveOffers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { planId, billingCycle } = req.query as { planId?: string; billingCycle?: string };
      const offers = await this.getActiveOffersUseCase.execute(planId, billingCycle);
      return res.status(200).json({
        success: true,
        data: offers,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/admin/offers
   * Admin paginated list of all offers with filters
   */
  adminListOffers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        page,
        limit,
        search,
        status,
        discountType,
        sortBy,
        sortOrder,
      } = req.query as any;

      const currentPage = page ? parseInt(page, 10) : 1;
      const currentLimit = limit ? parseInt(limit, 10) : 10;

      const result = await this.adminListOffersUseCase.execute({
        page: currentPage,
        limit: currentLimit,
        search,
        status,
        discountType,
        sortBy,
        sortOrder,
      });

      const totalPages = Math.ceil(result.total / currentLimit);

      return res.status(200).json({
        success: true,
        data: {
          items: result.offers,
          pagination: {
            currentPage,
            totalPages,
            totalItems: result.total,
            limit: currentLimit,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/admin/offers
   * Admin create a new promotional default offer
   */
  adminCreateOffer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.adminCreateOfferUseCase.execute(req.body);
      return res.status(201).json({
        success: true,
        message: "Offer created successfully.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/admin/offers/:id
   * Admin update an existing offer
   */
  adminUpdateOffer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const result = await this.adminUpdateOfferUseCase.execute(id, req.body);
      return res.status(200).json({
        success: true,
        message: "Offer updated successfully.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/admin/offers/:id/toggle
   * Instant status toggle (active/disabled)
   */
  adminToggleOffer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const result = await this.adminToggleOfferUseCase.execute(id);
      return res.status(200).json({
        success: true,
        message: `Offer '${result.title}' is now ${result.isActive ? "active" : "disabled"}.`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/admin/offers/:id
   * Admin delete an offer
   */
  adminDeleteOffer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      await this.adminDeleteOfferUseCase.execute(id);
      return res.status(200).json({
        success: true,
        message: "Offer deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/admin/offers/analytics
   * Aggregated redemption metrics & savings summary
   */
  adminGetAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const analytics = await this.adminGetOfferAnalyticsUseCase.execute();
      return res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  };
}
