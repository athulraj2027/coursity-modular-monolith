import { Router } from "express";
import { WishlistController } from "../controllers/wishlist.controller";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { isBlockedMiddleware } from "@/app/middlewares/is-blocked.middleware";
import validate from "@/app/middlewares/validate";
import { toggleWishlistSchema } from "../schemas/wishlist.schema";

export const createWishlistRouter = (controller: WishlistController): Router => {
  const router = Router();

  // All wishlist routes require authentication and active non-blocked student/user status
  router.use(authMiddleware);
  router.use(isBlockedMiddleware);

  // 1. Get full paginated wishlist
  router.get("/", controller.getWishlist);

  // 2. Get wishlist IDs array for global UI state
  router.get("/ids", controller.getWishlistIds);

  // 3. Toggle a course in/out of wishlist
  router.post("/toggle", validate(toggleWishlistSchema), controller.toggleWishlist);

  // 4. Remove a specific course
  router.delete("/:courseId", controller.removeItem);

  // 5. Clear all items
  router.delete("/", controller.clearWishlist);

  return router;
};
