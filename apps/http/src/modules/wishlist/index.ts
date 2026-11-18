import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import defaultPrisma from "@/infrastructure/database/prisma.client";
import { PrismaWishlistRepository } from "./infrastructure/repositories/prisma-wishlist.repository";
import {
  IWishlistRepository,
  IWishlistQueryRepository,
  IWishlistMutationRepository,
} from "./domain/repositories/wishlist.repository.interface";
import { ToggleWishlistUseCase } from "./application/use-cases/toggle-wishlist.usecase";
import { GetUserWishlistUseCase } from "./application/use-cases/get-user-wishlist.usecase";
import { GetWishlistIdsUseCase } from "./application/use-cases/get-wishlist-ids.usecase";
import { RemoveWishlistItemUseCase } from "./application/use-cases/remove-wishlist-item.usecase";
import { ClearWishlistUseCase } from "./application/use-cases/clear-wishlist.usecase";
import { WishlistController } from "./presentation/controllers/wishlist.controller";
import { createWishlistRouter, WishlistRouterOptions } from "./presentation/routes/wishlist.routes";

export interface WishlistModuleDependencies {
  wishlistRepo?: IWishlistRepository;
  routerOptions?: WishlistRouterOptions;
}

export function createWishlistModule(
  depsOrPrisma?: WishlistModuleDependencies | PrismaClient
) {
  let wishlistRepo: IWishlistRepository;
  let routerOptions: WishlistRouterOptions | undefined;

  if (depsOrPrisma && "$transaction" in depsOrPrisma) {
    wishlistRepo = new PrismaWishlistRepository(depsOrPrisma as PrismaClient);
  } else {
    const deps = (depsOrPrisma as WishlistModuleDependencies) || {};
    wishlistRepo = deps.wishlistRepo || new PrismaWishlistRepository(defaultPrisma);
    routerOptions = deps.routerOptions;
  }

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

  const wishlistRouter = createWishlistRouter(wishlistController, routerOptions);

  return {
    wishlistRepo,
    wishlistController,
    wishlistRouter,
    useCases: {
      toggleWishlistUseCase,
      getUserWishlistUseCase,
      getWishlistIdsUseCase,
      removeWishlistItemUseCase,
      clearWishlistUseCase,
    },
  };
}

const defaultModule = createWishlistModule();
export const wishlistRouter: Router = defaultModule.wishlistRouter;
export const wishlistRepo: IWishlistRepository = defaultModule.wishlistRepo;

// Domain Entities
export * from "./domain/entities/wishlist.entity";

// Domain DTOs
export * from "./domain/dtos/wishlist.dto";

// Domain Repositories
export * from "./domain/repositories/wishlist.repository.interface";

// Domain Policies & Errors
export * from "./domain/policies";
export * from "./domain/errors";

// Infrastructure Repositories
export * from "./infrastructure/repositories/prisma-wishlist.repository";

// Application Use Cases
export * from "./application/use-cases/toggle-wishlist.usecase";
export * from "./application/use-cases/get-user-wishlist.usecase";
export * from "./application/use-cases/get-wishlist-ids.usecase";
export * from "./application/use-cases/remove-wishlist-item.usecase";
export * from "./application/use-cases/clear-wishlist.usecase";

// Presentation
export * from "./presentation/schemas/wishlist.schema";
export * from "./presentation/controllers";
export * from "./presentation/routes/wishlist.routes";

export default wishlistRouter;
