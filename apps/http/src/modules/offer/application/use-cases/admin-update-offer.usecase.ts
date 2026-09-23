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

    let normalizedCode: string | null = existing.code;
    if (dto.code !== undefined) {
      if (dto.code && dto.code.trim()) {
        normalizedCode = dto.code.trim().toUpperCase();
        if (normalizedCode !== existing.code) {
          const duplicate = await this.offerRepo.findByCode(normalizedCode);
          if (duplicate && duplicate.id !== id) {
            throw new ConflictError(`Promo code '${normalizedCode}' is already in use by another offer.`);
          }
        }
      } else {
        normalizedCode = null;
      }
    }

    return this.offerRepo.update(id, {
      ...dto,
      code: normalizedCode,
    });
  }
}
