import { Request, Response, NextFunction } from "express";
import { GetWishlistIdsUseCase } from "../../application/use-cases/get-wishlist-ids.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared/utils/api-response";

export class GetWishlistIdsController {
  constructor(private readonly getWishlistIdsUseCase: GetWishlistIdsUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError("Authentication required. Please sign in.");
      }
      const ids = await this.getWishlistIdsUseCase.execute(userId);

      return ApiResponse.success(res, ids);
    } catch (error) {
      next(error);
    }
  };
}
