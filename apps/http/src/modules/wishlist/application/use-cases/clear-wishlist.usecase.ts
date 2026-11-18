import {
  IWishlistQueryRepository,
  IWishlistMutationRepository,
} from "../../domain/repositories/wishlist.repository.interface";
import { InvalidWishlistOperationError } from "../../domain/errors/wishlist.errors";

export class ClearWishlistUseCase {
  constructor(
    private readonly wishlistRepo: IWishlistQueryRepository & IWishlistMutationRepository
  ) {}

  async execute(userId: string): Promise<{ clearedCount: number }> {
    if (!userId) {
      throw new InvalidWishlistOperationError("User ID is required");
    }

    const wishlist = await this.wishlistRepo.getOrCreateWishlist(userId);
    const count = await this.wishlistRepo.clearWishlist(wishlist.id);
    return { clearedCount: count };
  }
}
