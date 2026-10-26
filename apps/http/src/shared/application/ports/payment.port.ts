export interface CreatePaymentOrderInput {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface PaymentOrderResult {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface VerifySignatureInput {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface PaymentDetails {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  method?: string;
  email?: string;
  contact?: string;
  createdAt: number;
}

export interface RefundPaymentInput {
  paymentId: string;
  amount?: number;
  currency?: string;
  notes?: Record<string, string>;
}

export interface RefundPaymentResult {
  refundId: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: string;
  receipt?: string;
  notes?: Record<string, string>;
  createdAt: number;
}

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

/**
 * Aggregated port contract implementing segregated payment interfaces.
 * Preserves backward compatibility while enabling Interface Segregation.
 */
export abstract class IPaymentGateway
  implements
    IPaymentOrderGateway,
    IPaymentVerificationGateway,
    IPaymentDetailsGateway,
    IPaymentRefundGateway
{
  abstract createOrder(input: CreatePaymentOrderInput): Promise<PaymentOrderResult>;
  abstract verifyPaymentSignature(input: VerifySignatureInput): boolean;
  abstract verifyWebhookSignature(body: string | Buffer, signature: string): boolean;
  abstract fetchPaymentDetails(paymentId: string): Promise<PaymentDetails | null>;
  abstract refundPayment(input: RefundPaymentInput): Promise<RefundPaymentResult>;
  abstract isConfigured(): boolean;
}
