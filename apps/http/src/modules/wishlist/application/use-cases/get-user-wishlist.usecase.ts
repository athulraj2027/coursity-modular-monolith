import { IWishlistRepository } from "../../domain/repositories/wishlist.repository.interface";
import { GetUserWishlistDTO, PaginatedWishlistResultDTO } from "../../domain/dtos/wishlist.dto";
import { BadRequestError } from "@/app/errors";

export class GetUserWishlistUseCase {
  constructor(private readonly wishlistRepo: IWishlistRepository) {}

  async execute(dto: GetUserWishlistDTO): Promise<PaginatedWishlistResultDTO> {
    if (!dto.userId) {
      throw new BadRequestError("User ID is required");
    }

    return this.wishlistRepo.getUserWishlistItems(dto);
  }
}
