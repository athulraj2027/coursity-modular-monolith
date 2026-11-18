import {
  IOfferQueryRepository,
  IAdminOfferRepository,
} from "../../domain/repositories/offer.repository";
import { OfferEntity } from "../../domain/entities/offer.entity";
import { OfferNotFoundError } from "../../domain/errors/offer.errors";

export type AdminToggleOfferRepository = IOfferQueryRepository & IAdminOfferRepository;

export class AdminToggleOfferUseCase {
  constructor(private readonly offerRepo: AdminToggleOfferRepository) {}

  async execute(id: string): Promise<OfferEntity> {
    const existing = await this.offerRepo.findById(id);
    if (!existing) {
      throw new OfferNotFoundError(`Offer with ID '${id}' not found.`);
    }

    return this.offerRepo.toggleStatus(id);
  }
}
