import { RazorpayPaymentService } from "./services/razorpay-payment.service";
import { IPaymentGateway } from "./contracts/payment-gateway.abstract";

export const paymentGateway: IPaymentGateway = new RazorpayPaymentService();

export * from "./contracts/payment-gateway.abstract";
export * from "./services/razorpay-payment.service";
export default paymentGateway;
