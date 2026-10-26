import { ToggleWishlistUseCase } from "../../application/use-cases/toggle-wishlist.usecase";
import { GetUserWishlistUseCase } from "../../application/use-cases/get-user-wishlist.usecase";
import { GetWishlistIdsUseCase } from "../../application/use-cases/get-wishlist-ids.usecase";
import { RemoveWishlistItemUseCase } from "../../application/use-cases/remove-wishlist-item.usecase";
import { ClearWishlistUseCase } from "../../application/use-cases/clear-wishlist.usecase";
import { ToggleWishlistController } from "./toggle-wishlist.controller";
import { GetWishlistController } from "./get-wishlist.controller";
import { GetWishlistIdsController } from "./get-wishlist-ids.controller";
import { RemoveWishlistItemController } from "./remove-wishlist-item.controller";
import { ClearWishlistController } from "./clear-wishlist.controller";

export class WishlistController {
  public readonly toggleWishlistController: ToggleWishlistController;
  public readonly getWishlistController: GetWishlistController;
  public readonly getWishlistIdsController: GetWishlistIdsController;
  public readonly removeWishlistItemController: RemoveWishlistItemController;
  public readonly clearWishlistController: ClearWishlistController;

  constructor(
    toggleWishlistUseCase: ToggleWishlistUseCase,
    getUserWishlistUseCase: GetUserWishlistUseCase,
    getWishlistIdsUseCase: GetWishlistIdsUseCase,
    removeWishlistItemUseCase: RemoveWishlistItemUseCase,
    clearWishlistUseCase: ClearWishlistUseCase
  ) {
    this.toggleWishlistController = new ToggleWishlistController(toggleWishlistUseCase);
    this.getWishlistController = new GetWishlistController(getUserWishlistUseCase);
    this.getWishlistIdsController = new GetWishlistIdsController(getWishlistIdsUseCase);
    this.removeWishlistItemController = new RemoveWishlistItemController(removeWishlistItemUseCase);
    this.clearWishlistController = new ClearWishlistController(clearWishlistUseCase);
  }

  toggleWishlist = (req: any, res: any, next: any) => this.toggleWishlistController.execute(req, res, next);
  getWishlist = (req: any, res: any, next: any) => this.getWishlistController.execute(req, res, next);
  getWishlistIds = (req: any, res: any, next: any) => this.getWishlistIdsController.execute(req, res, next);
  removeItem = (req: any, res: any, next: any) => this.removeWishlistItemController.execute(req, res, next);
  clearWishlist = (req: any, res: any, next: any) => this.clearWishlistController.execute(req, res, next);
}
