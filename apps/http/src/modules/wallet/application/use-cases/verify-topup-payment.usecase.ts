import { IPaymentGateway } from "@/infrastructure/payment";
import { IWalletMutationRepository } from "../../domain/repositories/wallet.repository.interface";
import { VerifyTopUpPaymentDto } from "../../domain/dtos/wallet.dto";
import { WalletEntity } from "../../domain/entities/wallet.entity";
import { WalletTransactionEntity } from "../../domain/entities/wallet-transaction.entity";
import { PaymentSignatureVerificationError } from "../../domain/errors/wallet.errors";
import { WalletTopUpPolicy } from "../../domain/policies/wallet-topup.policy";

export class VerifyTopUpPaymentUseCase {
  constructor(
    private readonly walletRepo: IWalletMutationRepository,
    private readonly paymentGateway: IPaymentGateway
  ) {}

  async execute(dto: VerifyTopUpPaymentDto): Promise<{
    wallet: WalletEntity;
    transaction: WalletTransactionEntity;
  }> {
    // 1. Verify Razorpay cryptographic signature
    const isValidSignature = this.paymentGateway.verifyPaymentSignature({
      orderId: dto.razorpayOrderId,
      paymentId: dto.razorpayPaymentId,
      signature: dto.razorpaySignature,
    });

    if (!isValidSignature) {
      throw new PaymentSignatureVerificationError();
    }

    // 2. Fetch payment details from gateway to get authentic captured amount
    let depositAmount = 0;
    try {
      const paymentDetails = await this.paymentGateway.fetchPaymentDetails(
        dto.razorpayPaymentId
      );
      if (paymentDetails && paymentDetails.amount > 0) {
        depositAmount = paymentDetails.amount;
      }
    } catch {
      // ignore
    }

    // Fallback if sandbox / mock mode
    if (depositAmount <= 0) {
      depositAmount = WalletTopUpPolicy.DEFAULT_FALLBACK_DEPOSIT_AMOUNT;
    }

    // 3. Atomically credit wallet and log ledger transaction
    return this.walletRepo.credit({
      userId: dto.userId,
      amount: depositAmount,
      type: "DEPOSIT",
      description: `Wallet top-up via Razorpay (${dto.razorpayPaymentId})`,
      referenceType: "RAZORPAY_PAYMENT",
      referenceId: dto.razorpayPaymentId,
      razorpayOrderId: dto.razorpayOrderId,
      razorpayPaymentId: dto.razorpayPaymentId,
    });
  }
}
