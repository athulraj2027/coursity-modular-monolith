import { IOfferRepository } from "../../domain/repositories/offer.repository";
import { ListOffersQueryDto } from "../../domain/dtos/offer.dto";
import { OfferEntity } from "../../domain/entities/offer.entity";

export class AdminListOffersUseCase {
  constructor(private readonly offerRepo: IOfferRepository) {}

  async execute(query: ListOffersQueryDto): Promise<{ offers: OfferEntity[]; total: number }> {
    return this.offerRepo.findAllAdmin(query);
  }
}
