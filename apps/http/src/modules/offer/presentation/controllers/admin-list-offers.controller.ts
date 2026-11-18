import { Request, Response, NextFunction } from "express";
import { AdminListOffersUseCase } from "../../application/use-cases/admin-list-offers.usecase";
import { ApiResponse } from "@/shared";
import { listOffersQueryObjectSchema } from "../schemas/offer.schema";

export class AdminListOffersController {
  constructor(private readonly adminListOffersUseCase: AdminListOffersUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedQuery = listOffersQueryObjectSchema.parse(req.query);

      const currentPage = validatedQuery.page;
      const currentLimit = validatedQuery.limit;

      const result = await this.adminListOffersUseCase.execute({
        page: currentPage,
        limit: currentLimit,
        search: validatedQuery.search,
        status: validatedQuery.status as any,
        discountType: validatedQuery.discountType as any,
        sortBy: validatedQuery.sortBy,
        sortOrder: validatedQuery.sortOrder,
      });

      const totalPages = Math.ceil(result.total / currentLimit) || 1;

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
