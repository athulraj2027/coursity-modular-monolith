import { IPaymentGateway, PaymentOrderResult } from "@/infrastructure/payment";
import { CreateTopUpOrderDto } from "../../domain/dtos/wallet.dto";
import { WalletTopUpPolicy } from "../../domain/policies/wallet-topup.policy";

export class CreateTopUpOrderUseCase {
  constructor(private readonly paymentGateway: IPaymentGateway) {}

  async execute(dto: CreateTopUpOrderDto): Promise<PaymentOrderResult> {
    WalletTopUpPolicy.validateTopUpAmount(dto.amount);

    const receipt = WalletTopUpPolicy.generateTopUpReceipt(dto.userId);
    const order = await this.paymentGateway.createOrder({
      amount: dto.amount,
      currency: "INR",
      receipt,
      notes: {
        userId: dto.userId,
        type: "WALLET_TOPUP",
      },
    });

    return order;
  }
}
