import { IPayoutRequestRepository } from "../../domain/repositories/payout-request.repository.interface";
import { AdminProcessPayoutDto } from "../../domain/dtos/payout-request.dto";
import { PayoutRequestEntity } from "../../domain/entities/payout-request.entity";

export class AdminProcessPayoutUseCase {
  constructor(private readonly payoutRepo: IPayoutRequestRepository) {}

  async execute(dto: AdminProcessPayoutDto): Promise<PayoutRequestEntity> {
    return this.payoutRepo.processPayout(dto);
  }
}
