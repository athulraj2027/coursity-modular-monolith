import { IPaymentGateway, PaymentOrderResult } from "@/infrastructure/payment/contracts/payment-gateway.abstract";
import { CreateTopUpOrderDto } from "../../domain/dtos/wallet.dto";
import { BadRequestError } from "@/app/errors";

export class CreateTopUpOrderUseCase {
  constructor(private readonly paymentGateway: IPaymentGateway) {}

  async execute(dto: CreateTopUpOrderDto): Promise<PaymentOrderResult> {
    if (dto.amount < 10) {
      throw new BadRequestError("Minimum wallet top-up amount is ₹10");
    }
    if (dto.amount > 100000) {
      throw new BadRequestError("Maximum single top-up amount is ₹1,00,000");
    }

    const receipt = `topup_${dto.userId.slice(0, 8)}_${Date.now()}`;
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
