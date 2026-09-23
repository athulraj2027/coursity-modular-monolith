import { IOfferRepository } from "../../domain/repositories/offer.repository";
import { CreateOfferDto } from "../../domain/dtos/offer.dto";
import { OfferEntity } from "../../domain/entities/offer.entity";
import { BadRequestError, ConflictError } from "@/app/errors";

export class AdminCreateOfferUseCase {
  constructor(private readonly offerRepo: IOfferRepository) {}

  async execute(dto: CreateOfferDto): Promise<OfferEntity> {
    if (!dto.title || !dto.title.trim()) {
      throw new BadRequestError("Offer title is required.");
    }

    if (dto.discountValue <= 0) {
      throw new BadRequestError("Discount value must be greater than 0.");
    }

    if (dto.discountType === "PERCENTAGE" && dto.discountValue > 100) {
      throw new BadRequestError("Percentage discount cannot exceed 100%.");
    }

    let normalizedCode: string | null = null;
    if (dto.code && dto.code.trim()) {
      normalizedCode = dto.code.trim().toUpperCase();
      const existing = await this.offerRepo.findByCode(normalizedCode);
      if (existing) {
        throw new ConflictError(`Promo code '${normalizedCode}' already exists.`);
      }
    } else if (!dto.isAutoApplied) {
      throw new BadRequestError("A promo code is required unless the offer is set as Auto-Applied.");
    }

    if (dto.validFrom && dto.validUntil) {
      if (new Date(dto.validUntil) <= new Date(dto.validFrom)) {
        throw new BadRequestError("Expiry date must be after the start date.");
      }
    }

    return this.offerRepo.create({
      ...dto,
      code: normalizedCode,
      title: dto.title.trim(),
    });
  }
}
