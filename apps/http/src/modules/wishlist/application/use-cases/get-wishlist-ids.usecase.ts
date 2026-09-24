import { IWishlistRepository } from "../../domain/repositories/wishlist.repository.interface";
import { BadRequestError } from "@/app/errors";

export class GetWishlistIdsUseCase {
  constructor(private readonly wishlistRepo: IWishlistRepository) {}

  async execute(userId: string): Promise<string[]> {
    if (!userId) {
      throw new BadRequestError("User ID is required");
    }

    return this.wishlistRepo.getWishlistCourseIds(userId);
  }
}
