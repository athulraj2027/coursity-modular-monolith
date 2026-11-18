import {
  IWishlistQueryRepository,
  IWishlistMutationRepository,
} from "../../domain/repositories/wishlist.repository.interface";
import { InvalidWishlistOperationError } from "../../domain/errors/wishlist.errors";

export class RemoveWishlistItemUseCase {
  constructor(
    private readonly wishlistRepo: IWishlistQueryRepository & IWishlistMutationRepository
  ) {}

  async execute(userId: string, courseId: string): Promise<boolean> {
    if (!userId || !courseId) {
      throw new InvalidWishlistOperationError("User ID and Course ID are required");
    }

    const wishlist = await this.wishlistRepo.getOrCreateWishlist(userId);
    return this.wishlistRepo.removeItem(wishlist.id, courseId);
  }
}
