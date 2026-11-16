import {
    CreatePaymentOrderInput,
    PaymentOrderResult,
    VerifySignatureInput,
    PaymentDetails,
    RefundPaymentInput,
    RefundPaymentResult,
} from "../entities/payment.entity";

export * from "../entities/payment.entity";

export interface IPaymentOrderGateway {
    createOrder(input: CreatePaymentOrderInput): Promise<PaymentOrderResult>;
}

export interface IPaymentVerificationGateway {
    verifyPaymentSignature(input: VerifySignatureInput): boolean;
    verifyWebhookSignature(body: string | Buffer, signature: string): boolean;
}

export interface IPaymentDetailsGateway {
    fetchPaymentDetails(paymentId: string): Promise<PaymentDetails | null>;
}

export interface IPaymentRefundGateway {
    refundPayment(input: RefundPaymentInput): Promise<RefundPaymentResult>;
}

export interface IPaymentGateway
    extends IPaymentOrderGateway,
    IPaymentVerificationGateway,
    IPaymentDetailsGateway,
    IPaymentRefundGateway {
    isConfigured(): boolean;
}

export abstract class PaymentGateway implements IPaymentGateway {
    abstract createOrder(input: CreatePaymentOrderInput): Promise<PaymentOrderResult>;
    abstract verifyPaymentSignature(input: VerifySignatureInput): boolean;
    abstract verifyWebhookSignature(body: string | Buffer, signature: string): boolean;
    abstract fetchPaymentDetails(paymentId: string): Promise<PaymentDetails | null>;
    abstract refundPayment(input: RefundPaymentInput): Promise<RefundPaymentResult>;
    abstract isConfigured(): boolean;
}

// Backward-compatibility alias
export { PaymentGateway as IPaymentGatewayBase };

