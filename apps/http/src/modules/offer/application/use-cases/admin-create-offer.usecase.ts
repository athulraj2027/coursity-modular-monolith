import { IAdminOfferRepository } from "../../domain/repositories/offer.repository";
import { CreateOfferDto } from "../../domain/dtos/offer.dto";
import { OfferEntity } from "../../domain/entities/offer.entity";
import { OfferValidationPolicy } from "../../domain/policies";

export class AdminCreateOfferUseCase {
  constructor(private readonly offerRepo: IAdminOfferRepository) {}

  async execute(dto: CreateOfferDto): Promise<OfferEntity> {
    // 1. Domain Validation Policy
    OfferValidationPolicy.validateCreation(dto);

    return this.offerRepo.create({
      ...dto,
      title: dto.title.trim(),
      description: dto.description ? dto.description.trim() : null,
    });
  }
}
