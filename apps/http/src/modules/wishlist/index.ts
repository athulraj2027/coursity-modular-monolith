import defaultPrisma from "@/infrastructure/database/prisma.client";
import { PrismaWishlistRepository } from "./infrastructure/repositories/prisma-wishlist.repository";
import { ToggleWishlistUseCase } from "./application/use-cases/toggle-wishlist.usecase";
import { GetUserWishlistUseCase } from "./application/use-cases/get-user-wishlist.usecase";
import { GetWishlistIdsUseCase } from "./application/use-cases/get-wishlist-ids.usecase";
import { RemoveWishlistItemUseCase } from "./application/use-cases/remove-wishlist-item.usecase";
import { ClearWishlistUseCase } from "./application/use-cases/clear-wishlist.usecase";
import { WishlistController } from "./presentation/controllers/wishlist.controller";
import { createWishlistRouter } from "./presentation/routes/wishlist.routes";

export function createWishlistModule(prisma = defaultPrisma) {
  const wishlistRepo = new PrismaWishlistRepository(prisma);

  const toggleWishlistUseCase = new ToggleWishlistUseCase(wishlistRepo);
  const getUserWishlistUseCase = new GetUserWishlistUseCase(wishlistRepo);
  const getWishlistIdsUseCase = new GetWishlistIdsUseCase(wishlistRepo);
  const removeWishlistItemUseCase = new RemoveWishlistItemUseCase(wishlistRepo);
  const clearWishlistUseCase = new ClearWishlistUseCase(wishlistRepo);

  const wishlistController = new WishlistController(
    toggleWishlistUseCase,
    getUserWishlistUseCase,
    getWishlistIdsUseCase,
    removeWishlistItemUseCase,
    clearWishlistUseCase
  );

  const wishlistRouter = createWishlistRouter(wishlistController);

  return {
    wishlistRepo,
    wishlistController,
    wishlistRouter,
  };
}

const defaultModule = createWishlistModule();
export const wishlistRouter = defaultModule.wishlistRouter;
export default wishlistRouter;
