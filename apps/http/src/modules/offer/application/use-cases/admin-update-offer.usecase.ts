import {
  IOfferQueryRepository,
  IAdminOfferRepository,
} from "../../domain/repositories/offer.repository";
import { UpdateOfferDto } from "../../domain/dtos/offer.dto";
import { OfferEntity } from "../../domain/entities/offer.entity";
import { OfferNotFoundError } from "../../domain/errors/offer.errors";
import { OfferValidationPolicy } from "../../domain/policies";

export type AdminUpdateOfferRepository = IOfferQueryRepository & IAdminOfferRepository;

export class AdminUpdateOfferUseCase {
  constructor(private readonly offerRepo: AdminUpdateOfferRepository) {}

  async execute(id: string, dto: UpdateOfferDto): Promise<OfferEntity> {
    const existing = await this.offerRepo.findById(id);
    if (!existing) {
      throw new OfferNotFoundError(`Offer with ID '${id}' not found.`);
    }

    // Domain Validation Policy
    OfferValidationPolicy.validateUpdate(
      dto,
      existing.discountType,
      Number(existing.discountValue),
      existing.validFrom,
      existing.validUntil
    );

    return this.offerRepo.update(id, {
      ...dto,
      title: dto.title !== undefined ? dto.title.trim() : undefined,
      description:
        dto.description !== undefined
          ? dto.description ? dto.description.trim() : null
          : undefined,
    });
  }
}
