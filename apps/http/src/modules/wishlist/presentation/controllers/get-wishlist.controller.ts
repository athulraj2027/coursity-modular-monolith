import { Request, Response, NextFunction } from "express";
import { GetUserWishlistUseCase } from "../../application/use-cases/get-user-wishlist.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared/utils/api-response";
import { getUserWishlistQuerySchema } from "../schemas/wishlist.schema";

export class GetWishlistController {
  constructor(private readonly getUserWishlistUseCase: GetUserWishlistUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError("Authentication required. Please sign in.");
      }
      const query = getUserWishlistQuerySchema.parse(req.query);

      const result = await this.getUserWishlistUseCase.execute({
        userId,
        page: query.page,
        limit: query.limit,
        search: query.search,
        sortBy: query.sortBy,
      });

      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };
}
