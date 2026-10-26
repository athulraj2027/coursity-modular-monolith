import { Request, Response, NextFunction } from "express";
import { AdminListOffersUseCase } from "../../application/use-cases/admin-list-offers.usecase";
import { ApiResponse } from "@/shared";

export class AdminListOffersController {
  constructor(private readonly adminListOffersUseCase: AdminListOffersUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
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

      return ApiResponse.success(res, {
        items: result.offers,
        pagination: {
          currentPage,
          totalPages,
          totalItems: result.total,
          limit: currentLimit,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
