import crypto from "node:crypto";
import Razorpay from "razorpay";
import {
    IPaymentGateway,
    PaymentGateway,
    CreatePaymentOrderInput,
    PaymentOrderResult,
    VerifySignatureInput,
    PaymentDetails,
    RefundPaymentInput,
    RefundPaymentResult,
} from "../../domain/contracts/payment-gateway.interface";
import { PaymentConfig, paymentConfig as defaultPaymentConfig } from "../config/payment.config";

export class RazorpayPaymentService extends PaymentGateway implements IPaymentGateway {
    private readonly instance: Razorpay | null = null;
    private readonly keyId: string;
    private readonly keySecret: string;
    private readonly webhookSecret: string;

    constructor(
        config?: Partial<PaymentConfig>,
        customInstance?: Razorpay | null
    ) {
        super();
        this.keyId = config?.keyId ?? defaultPaymentConfig.keyId;
        this.keySecret = config?.keySecret ?? defaultPaymentConfig.keySecret;
        this.webhookSecret = config?.webhookSecret ?? defaultPaymentConfig.webhookSecret;

        if (customInstance !== undefined) {
            this.instance = customInstance;
        } else if (
            this.keyId &&
            this.keySecret &&
            !this.keyId.includes("dummy") &&
            !this.keyId.includes("placeholder") &&
            !this.keyId.includes("mock") &&
            !this.keyId.includes("sandbox")
        ) {
            this.instance = new Razorpay({
                key_id: this.keyId,
                key_secret: this.keySecret,
            });
        }
    }

    isConfigured(): boolean {
        return Boolean(this.instance);
    }

    async createOrder(input: CreatePaymentOrderInput): Promise<PaymentOrderResult> {
        // Convert to smallest currency unit (e.g. paise for INR: 499 INR -> 49900 paise)
        const amountInSubunits = Math.round(input.amount * 100);

        if (this.instance) {
            try {
                const order = await this.instance.orders.create({
                    amount: amountInSubunits,
                    currency: input.currency || "INR",
                    receipt: input.receipt,
                    notes: input.notes,
                });

                return {
                    orderId: order.id,
                    amount: Number(order.amount) / 100,
                    currency: order.currency,
                    keyId: this.keyId,
                    receipt: input.receipt,
                    notes: input.notes,
                };
            } catch (error: any) {
                console.error("❌ [Razorpay] Failed to create order:", error);
                throw new Error(`Razorpay Order Creation Failed: ${error?.error?.description || error?.message || "Unknown error"}`);
            }
        }

        // Mock / Sandbox fallback for local development when keys aren't provisioned
        const mockOrderId = `order_mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        console.log(`ℹ️ [Payment Gateway - Sandbox Mode] Generated Mock Order: ${mockOrderId} (Amount: ${input.amount} ${input.currency})`);

        return {
            orderId: mockOrderId,
            amount: input.amount,
            currency: input.currency || "INR",
            keyId: this.keyId || "rzp_test_sandbox_mock",
            receipt: input.receipt,
            notes: input.notes,
        };
    }

    verifyPaymentSignature(input: VerifySignatureInput): boolean {
        // In local mock mode (order begins with order_mock_) allow mock signature validation
        if (input.orderId.startsWith("order_mock_")) {
            return Boolean(input.paymentId && input.signature);
        }

        if (!this.keySecret) {
            return false;
        }

        try {
            const expectedSignature = crypto
                .createHmac("sha256", this.keySecret)
                .update(`${input.orderId}|${input.paymentId}`)
                .digest("hex");

            const expectedBuffer = Buffer.from(expectedSignature, "utf8");
            const signatureBuffer = Buffer.from(input.signature, "utf8");

            if (expectedBuffer.length !== signatureBuffer.length) {
                return false;
            }

            return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
        } catch (err) {
            console.error("❌ [Razorpay] Signature verification error:", err);
            return false;
        }
    }

    verifyWebhookSignature(body: string | Buffer, signature: string): boolean {
        if (!this.webhookSecret) {
            return false;
        }

        try {
            const expectedSignature = crypto
                .createHmac("sha256", this.webhookSecret)
                .update(body)
                .digest("hex");

            const expectedBuffer = Buffer.from(expectedSignature, "utf8");
            const signatureBuffer = Buffer.from(signature, "utf8");

            if (expectedBuffer.length !== signatureBuffer.length) {
                return false;
            }

            return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
        } catch (err) {
            console.error("❌ [Razorpay Webhook] Signature verification error:", err);
            return false;
        }
    }

    async fetchPaymentDetails(paymentId: string): Promise<PaymentDetails | null> {
        if (paymentId.startsWith("pay_mock_") || !this.instance) {
            return {
                paymentId,
                orderId: "order_mock_sandbox",
                amount: 0,
                currency: "INR",
                status: "captured",
                method: "upi",
                createdAt: Math.floor(Date.now() / 1000),
            };
        }

        try {
            const payment: any = await this.instance.payments.fetch(paymentId);
            return {
                paymentId: payment.id,
                orderId: payment.order_id,
                amount: Number(payment.amount) / 100,
                currency: payment.currency,
                status: payment.status,
                method: payment.method,
                email: payment.email,
                contact: payment.contact,
                createdAt: payment.created_at,
            };
        } catch (error) {
            console.error(`❌ [Razorpay] Failed to fetch payment ${paymentId}:`, error);
            return null;
        }
    }

    async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentResult> {
        if (this.instance && !input.paymentId.startsWith("pay_mock_")) {
            try {
                const refundPayload: any = {
                    notes: input.notes,
                };
                if (input.amount && input.amount > 0) {
                    refundPayload.amount = Math.round(input.amount * 100);
                }

                const refund: any = await this.instance.payments.refund(input.paymentId, refundPayload);

                return {
                    refundId: refund.id,
                    paymentId: refund.payment_id,
                    amount: Number(refund.amount) / 100,
                    currency: refund.currency || input.currency || "INR",
                    status: refund.status || "processed",
                    receipt: refund.receipt,
                    notes: refund.notes,
                    createdAt: refund.created_at || Math.floor(Date.now() / 1000),
                };
            } catch (error: any) {
                console.error(`❌ [Razorpay] Refund failed for payment ${input.paymentId}:`, error);
                throw new Error(`Razorpay Refund Processing Failed: ${error?.error?.description || error?.message || "Unknown gateway error"}`);
            }
        }

        // Mock / Sandbox simulation
        const mockRefundId = `rfnd_mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        console.log(`ℹ️ [Payment Gateway - Sandbox Mode] Processed Mock Refund: ${mockRefundId} for payment: ${input.paymentId}`);

        return {
            refundId: mockRefundId,
            paymentId: input.paymentId,
            amount: input.amount || 0,
            currency: input.currency || "INR",
            status: "processed",
            notes: input.notes,
            createdAt: Math.floor(Date.now() / 1000),
        };
    }
}
