import { Request, Response, NextFunction } from "express";
import { RemoveWishlistItemUseCase } from "../../application/use-cases/remove-wishlist-item.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared/utils/api-response";
import { removeWishlistItemParamsSchema } from "../schemas/wishlist.schema";

export class RemoveWishlistItemController {
  constructor(private readonly removeWishlistItemUseCase: RemoveWishlistItemUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError("Authentication required. Please sign in.");
      }
      const { courseId } = removeWishlistItemParamsSchema.parse(req.params);

      const removed = await this.removeWishlistItemUseCase.execute(userId, courseId);

      return ApiResponse.success(
        res,
        { removed, courseId },
        "Course removed from your wishlist"
      );
    } catch (error) {
      next(error);
    }
  };
}
