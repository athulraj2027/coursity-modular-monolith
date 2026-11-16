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

