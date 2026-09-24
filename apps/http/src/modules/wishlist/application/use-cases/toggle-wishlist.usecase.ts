import { IWishlistRepository } from "../../domain/repositories/wishlist.repository.interface";
import { ToggleWishlistDTO, ToggleWishlistResultDTO } from "../../domain/dtos/wishlist.dto";
import { BadRequestError } from "@/app/errors";

export class ToggleWishlistUseCase {
  constructor(private readonly wishlistRepo: IWishlistRepository) {}

  async execute(dto: ToggleWishlistDTO): Promise<ToggleWishlistResultDTO> {
    if (!dto.userId) {
      throw new BadRequestError("User ID is required to toggle wishlist");
    }
    if (!dto.courseId) {
      throw new BadRequestError("Course ID is required to toggle wishlist");
    }

    const wishlist = await this.wishlistRepo.getOrCreateWishlist(dto.userId);
    const isCurrentlyWishlisted = await this.wishlistRepo.isCourseWishlisted(dto.userId, dto.courseId);

    if (isCurrentlyWishlisted) {
      await this.wishlistRepo.removeItem(wishlist.id, dto.courseId);
      return {
        isWishlisted: false,
        courseId: dto.courseId,
        wishlistId: wishlist.id,
        item: null,
      };
    } else {
      const item = await this.wishlistRepo.addItem(wishlist.id, dto.courseId);
      return {
        isWishlisted: true,
        courseId: dto.courseId,
        wishlistId: wishlist.id,
        item,
      };
    }
  }
}
