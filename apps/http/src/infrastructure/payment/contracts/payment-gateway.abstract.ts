export interface CreatePaymentOrderInput {
    amount: number; // in lowest currency unit (e.g. paise for INR, cents for USD) or standard decimal
    currency: string; // e.g. "INR", "USD"
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

export abstract class IPaymentGateway {
    /**
     * Creates an order with the payment gateway.
     */
    abstract createOrder(input: CreatePaymentOrderInput): Promise<PaymentOrderResult>;

    /**
     * Verifies the cryptographic HMAC signature returned by the checkout widget.
     */
    abstract verifyPaymentSignature(input: VerifySignatureInput): boolean;

    /**
     * Verifies a webhook payload signature against the webhook secret.
     */
    abstract verifyWebhookSignature(body: string | Buffer, signature: string): boolean;

    /**
     * Fetches details of a completed payment transaction.
     */
    abstract fetchPaymentDetails(paymentId: string): Promise<PaymentDetails | null>;

    /**
     * Returns whether the gateway is running in production or mock/dev test mode.
     */
    abstract isConfigured(): boolean;
}
