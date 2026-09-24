import { IWishlistRepository } from "../../domain/repositories/wishlist.repository.interface";
import { BadRequestError } from "@/app/errors";

export class ClearWishlistUseCase {
  constructor(private readonly wishlistRepo: IWishlistRepository) {}

  async execute(userId: string): Promise<{ clearedCount: number }> {
    if (!userId) {
      throw new BadRequestError("User ID is required");
    }

    const wishlist = await this.wishlistRepo.getOrCreateWishlist(userId);
    const count = await this.wishlistRepo.clearWishlist(wishlist.id);
    return { clearedCount: count };
  }
}
