import { Request, Response, NextFunction } from "express";
import { ToggleWishlistUseCase } from "../../application/use-cases/toggle-wishlist.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared/utils/api-response";
import { WishlistPolicy } from "../../domain/policies/wishlist.policy";

export class ToggleWishlistController {
  constructor(private readonly toggleWishlistUseCase: ToggleWishlistUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError("Authentication required. Please sign in.");
      }
      const { courseId } = req.body;

      const result = await this.toggleWishlistUseCase.execute({
        userId,
        courseId,
      });

      return ApiResponse.success(
        res,
        result,
        WishlistPolicy.formatToggleMessage(result.isWishlisted)
      );
    } catch (error) {
      next(error);
    }
  };
}
