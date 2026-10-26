import { Request, Response, NextFunction } from "express";
import { GetUserWishlistUseCase } from "../../application/use-cases/get-user-wishlist.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared/utils/api-response";

export class GetWishlistController {
  constructor(private readonly getUserWishlistUseCase: GetUserWishlistUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError("Authentication required. Please sign in.");
      }
      const { page, limit, search, sortBy } = req.query as any;

      const result = await this.getUserWishlistUseCase.execute({
        userId,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 12,
        search: search ? String(search) : undefined,
        sortBy: sortBy as any,
      });

      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };
}
