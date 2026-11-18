import { IWishlistQueryRepository } from "../../domain/repositories/wishlist.repository.interface";
import { GetUserWishlistDTO, PaginatedWishlistResultDTO } from "../../domain/dtos/wishlist.dto";
import { InvalidWishlistOperationError } from "../../domain/errors/wishlist.errors";
import { WishlistPolicy } from "../../domain/policies/wishlist.policy";

export class GetUserWishlistUseCase {
  constructor(private readonly wishlistRepo: IWishlistQueryRepository) {}

  async execute(dto: GetUserWishlistDTO): Promise<PaginatedWishlistResultDTO> {
    if (!dto.userId) {
      throw new InvalidWishlistOperationError("User ID is required");
    }

    const pagination = WishlistPolicy.normalizePagination(dto.page, dto.limit);

    return this.wishlistRepo.getUserWishlistItems({
      ...dto,
      page: pagination.page,
      limit: pagination.limit,
    });
  }
}
