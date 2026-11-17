import {
  IOfferQueryRepository,
  IAdminOfferRepository,
} from "../../domain/repositories/offer.repository";
import { OfferNotFoundError } from "../../domain/errors/offer.errors";

export type AdminDeleteOfferRepository = IOfferQueryRepository & IAdminOfferRepository;

export class AdminDeleteOfferUseCase {
  constructor(private readonly offerRepo: AdminDeleteOfferRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.offerRepo.findById(id);
    if (!existing) {
      throw new OfferNotFoundError(`Offer with ID '${id}' not found.`);
    }

    await this.offerRepo.delete(id);
  }
}
