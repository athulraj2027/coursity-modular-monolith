import { Request, Response, NextFunction } from "express";
import { ToggleWishlistUseCase } from "../../application/use-cases/toggle-wishlist.usecase";
import { GetUserWishlistUseCase } from "../../application/use-cases/get-user-wishlist.usecase";
import { GetWishlistIdsUseCase } from "../../application/use-cases/get-wishlist-ids.usecase";
import { RemoveWishlistItemUseCase } from "../../application/use-cases/remove-wishlist-item.usecase";
import { ClearWishlistUseCase } from "../../application/use-cases/clear-wishlist.usecase";
import { UnauthorizedError } from "@/app/errors";

export class WishlistController {
  constructor(
    private readonly toggleWishlistUseCase: ToggleWishlistUseCase,
    private readonly getUserWishlistUseCase: GetUserWishlistUseCase,
    private readonly getWishlistIdsUseCase: GetWishlistIdsUseCase,
    private readonly removeWishlistItemUseCase: RemoveWishlistItemUseCase,
    private readonly clearWishlistUseCase: ClearWishlistUseCase
  ) {}

  private getUserId(req: Request): string {
    const userId = req.user?.userId;
    if (!userId) {
      throw new UnauthorizedError("Authentication required. Please sign in.");
    }
    return userId;
  }

  /**
   * POST /api/wishlist/toggle
   * Toggles a course in/out of the student's wishlist
   */
  toggleWishlist = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = this.getUserId(req);
      const { courseId } = req.body;

      const result = await this.toggleWishlistUseCase.execute({
        userId,
        courseId,
      });

      return res.status(200).json({
        success: true,
        data: result,
        message: result.isWishlisted
          ? "Course added to your wishlist"
          : "Course removed from your wishlist",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/wishlist
   * Returns paginated wishlist items with full course details
   */
  getWishlist = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = this.getUserId(req);
      const { page, limit, search, sortBy } = req.query as any;

      const result = await this.getUserWishlistUseCase.execute({
        userId,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 12,
        search: search ? String(search) : undefined,
        sortBy: sortBy as any,
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
   * GET /api/wishlist/ids
   * Returns an array of wishlisted course IDs for global UI heart states
   */
  getWishlistIds = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = this.getUserId(req);
      const ids = await this.getWishlistIdsUseCase.execute(userId);

      return res.status(200).json({
        success: true,
        data: ids,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/wishlist/:courseId
   * Explicitly removes a course from the student's wishlist
   */
  removeItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = this.getUserId(req);
      const courseId = String(req.params.courseId);

      const removed = await this.removeWishlistItemUseCase.execute(userId, courseId);

      return res.status(200).json({
        success: true,
        data: { removed, courseId },
        message: "Course removed from your wishlist",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/wishlist
   * Clears all items in the student's wishlist
   */
  clearWishlist = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = this.getUserId(req);
      const result = await this.clearWishlistUseCase.execute(userId);

      return res.status(200).json({
        success: true,
        data: result,
        message: "Wishlist cleared successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}
