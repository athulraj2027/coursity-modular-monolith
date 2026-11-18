import {
  IWishlistQueryRepository,
  IWishlistMutationRepository,
} from "../../domain/repositories/wishlist.repository.interface";
import { ToggleWishlistDTO, ToggleWishlistResultDTO } from "../../domain/dtos/wishlist.dto";
import { InvalidWishlistOperationError } from "../../domain/errors/wishlist.errors";
import { WishlistPolicy } from "../../domain/policies/wishlist.policy";

export class ToggleWishlistUseCase {
  constructor(
    private readonly wishlistRepo: IWishlistQueryRepository & IWishlistMutationRepository
  ) {}

  async execute(dto: ToggleWishlistDTO): Promise<ToggleWishlistResultDTO> {
    if (!dto.userId) {
      throw new InvalidWishlistOperationError("User ID is required to toggle wishlist");
    }
    if (!dto.courseId) {
      throw new InvalidWishlistOperationError("Course ID is required to toggle wishlist");
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
      const currentIds = await this.wishlistRepo.getWishlistCourseIds(dto.userId);
      WishlistPolicy.validateCapacity(currentIds.length);

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
