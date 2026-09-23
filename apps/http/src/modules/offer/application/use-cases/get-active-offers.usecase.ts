import { IOfferRepository } from "../../domain/repositories/offer.repository";
import { OfferEntity } from "../../domain/entities/offer.entity";

export class GetActiveOffersUseCase {
  constructor(private readonly offerRepo: IOfferRepository) {}

  async execute(planId?: string, billingCycle?: string): Promise<OfferEntity[]> {
    return this.offerRepo.findActiveOffers(planId, billingCycle);
  }
}
