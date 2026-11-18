import { IWishlistQueryRepository } from "../../domain/repositories/wishlist.repository.interface";
import { InvalidWishlistOperationError } from "../../domain/errors/wishlist.errors";

export class GetWishlistIdsUseCase {
  constructor(private readonly wishlistRepo: IWishlistQueryRepository) {}

  async execute(userId: string): Promise<string[]> {
    if (!userId) {
      throw new InvalidWishlistOperationError("User ID is required");
    }

    return this.wishlistRepo.getWishlistCourseIds(userId);
  }
}
