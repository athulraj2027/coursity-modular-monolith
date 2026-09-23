import { IOfferRepository } from "../../domain/repositories/offer.repository";
import { OfferAnalyticsDto } from "../../domain/dtos/offer.dto";

export class AdminGetOfferAnalyticsUseCase {
  constructor(private readonly offerRepo: IOfferRepository) {}

  async execute(): Promise<OfferAnalyticsDto> {
    return this.offerRepo.getAnalytics();
  }
}
