import { IPayoutRequestRepository } from "../../domain/repositories/payout-request.repository.interface";
import { RequestPayoutDto } from "../../domain/dtos/payout-request.dto";
import { PayoutRequestEntity } from "../../domain/entities/payout-request.entity";

export class RequestPayoutUseCase {
  constructor(private readonly payoutRepo: IPayoutRequestRepository) {}

  async execute(dto: RequestPayoutDto): Promise<PayoutRequestEntity> {
    return this.payoutRepo.createRequest({
      userId: dto.userId,
      amount: dto.amount,
      bankDetailId: dto.bankDetailId || "",
    });
  }
}
