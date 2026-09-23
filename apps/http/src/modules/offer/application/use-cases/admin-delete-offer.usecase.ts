import { IOfferRepository } from "../../domain/repositories/offer.repository";
import { NotFoundError } from "@/app/errors";

export class AdminDeleteOfferUseCase {
  constructor(private readonly offerRepo: IOfferRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.offerRepo.findById(id);
    if (!existing) {
      throw new NotFoundError(`Offer with ID '${id}' not found.`);
    }

    await this.offerRepo.delete(id);
  }
}
