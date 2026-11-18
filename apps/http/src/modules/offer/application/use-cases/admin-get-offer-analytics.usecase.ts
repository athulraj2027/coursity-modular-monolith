import { IOfferRedemptionRepository } from "../../domain/repositories/offer.repository";
import { OfferAnalyticsDto } from "../../domain/dtos/offer.dto";

export class AdminGetOfferAnalyticsUseCase {
  constructor(private readonly offerRepo: IOfferRedemptionRepository) {}

  async execute(): Promise<OfferAnalyticsDto> {
    return this.offerRepo.getAnalytics();
  }
}
