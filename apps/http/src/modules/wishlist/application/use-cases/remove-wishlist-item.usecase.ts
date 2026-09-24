import { IWishlistRepository } from "../../domain/repositories/wishlist.repository.interface";
import { BadRequestError } from "@/app/errors";

export class RemoveWishlistItemUseCase {
  constructor(private readonly wishlistRepo: IWishlistRepository) {}

  async execute(userId: string, courseId: string): Promise<boolean> {
    if (!userId || !courseId) {
      throw new BadRequestError("User ID and Course ID are required");
    }

    const wishlist = await this.wishlistRepo.getOrCreateWishlist(userId);
    return this.wishlistRepo.removeItem(wishlist.id, courseId);
  }
}
