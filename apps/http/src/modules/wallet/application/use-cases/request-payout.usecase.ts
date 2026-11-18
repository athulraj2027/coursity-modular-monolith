import { IPayoutRequestMutationRepository } from "../../domain/repositories/payout-request.repository.interface";
import { RequestPayoutDto } from "../../domain/dtos/payout-request.dto";
import { PayoutRequestEntity } from "../../domain/entities/payout-request.entity";
import { WalletPayoutPolicy } from "../../domain/policies/wallet-payout.policy";

export class RequestPayoutUseCase {
  constructor(private readonly payoutRepo: IPayoutRequestMutationRepository) {}

  async execute(dto: RequestPayoutDto): Promise<PayoutRequestEntity> {
    WalletPayoutPolicy.validatePayoutAmount(dto.amount);

    return this.payoutRepo.createRequest({
      userId: dto.userId,
      amount: dto.amount,
      bankDetailId: dto.bankDetailId || "",
    });
  }
}
