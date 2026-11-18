import { RazorpayPaymentService } from "./infrastructure/services/razorpay-payment.service";
import { IPaymentGateway } from "./domain/contracts/payment-gateway.interface";

export const paymentGateway: IPaymentGateway = new RazorpayPaymentService();

// Domain Exports
export * from "./domain/entities/payment.entity";
export * from "./domain/contracts/payment-gateway.interface";

// Infrastructure Exports
export * from "./infrastructure/config/payment.config";
export * from "./infrastructure/services/razorpay-payment.service";

export default paymentGateway;
