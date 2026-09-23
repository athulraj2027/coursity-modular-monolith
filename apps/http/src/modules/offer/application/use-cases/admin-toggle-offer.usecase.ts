import { IOfferRepository } from "../../domain/repositories/offer.repository";
import { OfferEntity } from "../../domain/entities/offer.entity";
import { NotFoundError } from "@/app/errors";

export class AdminToggleOfferUseCase {
  constructor(private readonly offerRepo: IOfferRepository) {}

  async execute(id: string): Promise<OfferEntity> {
    const existing = await this.offerRepo.findById(id);
    if (!existing) {
      throw new NotFoundError(`Offer with ID '${id}' not found.`);
    }

    return this.offerRepo.toggleStatus(id);
  }
}
