import { IOfferRepository } from "../../domain/repositories/offer.repository";
import { UpdateOfferDto } from "../../domain/dtos/offer.dto";
import { OfferEntity } from "../../domain/entities/offer.entity";
import { BadRequestError, NotFoundError, ConflictError } from "@/app/errors";

export class AdminUpdateOfferUseCase {
  constructor(private readonly offerRepo: IOfferRepository) {}

  async execute(id: string, dto: UpdateOfferDto): Promise<OfferEntity> {
    const existing = await this.offerRepo.findById(id);
    if (!existing) {
      throw new NotFoundError(`Offer with ID '${id}' not found.`);
    }

    if (dto.discountValue !== undefined && dto.discountValue <= 0) {
      throw new BadRequestError("Discount value must be greater than 0.");
    }

    const effectiveType = dto.discountType || existing.discountType;
    const effectiveValue = dto.discountValue !== undefined ? dto.discountValue : Number(existing.discountValue);
    if (effectiveType === "PERCENTAGE" && effectiveValue > 100) {
      throw new BadRequestError("Percentage discount cannot exceed 100%.");
    }

    return this.offerRepo.update(id, {
      ...dto,
    });
  }
}
