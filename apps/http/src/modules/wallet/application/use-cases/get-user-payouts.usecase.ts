import { IPayoutRequestRepository } from "../../domain/repositories/payout-request.repository.interface";
import { ListPayoutsQueryDto } from "../../domain/dtos/payout-request.dto";
import { PayoutRequestEntity } from "../../domain/entities/payout-request.entity";

export class GetUserPayoutsUseCase {
  constructor(private readonly payoutRepo: IPayoutRequestRepository) {}

  async execute(
    query: ListPayoutsQueryDto
  ): Promise<{ items: PayoutRequestEntity[]; total: number }> {
    return this.payoutRepo.findByUserId(query);
  }
}
