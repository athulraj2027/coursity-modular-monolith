import { Request, Response, NextFunction } from "express";
import { ClearWishlistUseCase } from "../../application/use-cases/clear-wishlist.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared/utils/api-response";

export class ClearWishlistController {
  constructor(private readonly clearWishlistUseCase: ClearWishlistUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError("Authentication required. Please sign in.");
      }
      const result = await this.clearWishlistUseCase.execute(userId);

      return ApiResponse.success(res, result, "Wishlist cleared successfully");
    } catch (error) {
      next(error);
    }
  };
}
