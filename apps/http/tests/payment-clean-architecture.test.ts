import { describe, it } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import {
    IPaymentGateway,
    PaymentGateway,
    RazorpayPaymentService,
    CreatePaymentOrderInput,
    VerifySignatureInput,
    PaymentConfig,
} from "../src/infrastructure/payment";

describe("💳 Payment Clean Architecture & Contract Tests", () => {
    const testConfig: PaymentConfig = {
        keyId: "rzp_test_mock_12345",
        keySecret: "mock_secret_key_67890",
        webhookSecret: "mock_webhook_secret_abcde",
    };

    describe("1. Dependency Inversion & Construction", () => {
        it("should accept injected configuration rather than relying solely on global env", () => {
            const service: IPaymentGateway = new RazorpayPaymentService(testConfig);
            assert.ok(service);
            assert.equal(typeof service.createOrder, "function");
            assert.equal(typeof service.verifyPaymentSignature, "function");
            assert.equal(typeof service.verifyWebhookSignature, "function");
            assert.equal(typeof service.fetchPaymentDetails, "function");
            assert.equal(typeof service.refundPayment, "function");
        });
    });

    describe("2. Sandbox Order Creation & Mock Fallback", () => {
        it("should generate simulated order in sandbox mode without throwing", async () => {
            const service: IPaymentGateway = new RazorpayPaymentService(testConfig);
            const input: CreatePaymentOrderInput = {
                amount: 499,
                currency: "INR",
                receipt: "rcpt_test_001",
                notes: { courseId: "c_123" },
            };

            const result = await service.createOrder(input);

            assert.ok(result.orderId);
            assert.ok(result.orderId.startsWith("order_mock_"));
            assert.equal(result.amount, 499);
            assert.equal(result.currency, "INR");
            assert.equal(result.receipt, "rcpt_test_001");
            assert.equal(result.notes?.courseId, "c_123");
        });
    });

    describe("3. Signature Verification", () => {
        it("should verify valid HMAC SHA-256 signature against secret", () => {
            const service = new RazorpayPaymentService(testConfig);
            const orderId = "order_live_987654";
            const paymentId = "pay_live_123456";

            // Generate genuine signature
            const signature = crypto
                .createHmac("sha256", testConfig.keySecret)
                .update(`${orderId}|${paymentId}`)
                .digest("hex");

            const input: VerifySignatureInput = {
                orderId,
                paymentId,
                signature,
            };

            assert.equal(service.verifyPaymentSignature(input), true);
        });

        it("should reject tampered signature", () => {
            const service = new RazorpayPaymentService(testConfig);
            const input: VerifySignatureInput = {
                orderId: "order_live_987654",
                paymentId: "pay_live_123456",
                signature: "invalid_tampered_signature_hex",
            };

            assert.equal(service.verifyPaymentSignature(input), false);
        });

        it("should automatically allow mock order signatures in sandbox mode", () => {
            const service = new RazorpayPaymentService(testConfig);
            const input: VerifySignatureInput = {
                orderId: "order_mock_12345_abcde",
                paymentId: "pay_mock_54321",
                signature: "any_sandbox_signature",
            };

            assert.equal(service.verifyPaymentSignature(input), true);
        });

        it("should verify valid webhook signature", () => {
            const service = new RazorpayPaymentService(testConfig);
            const body = JSON.stringify({ event: "payment.captured", payload: { payment: { id: "pay_123" } } });

            const signature = crypto
                .createHmac("sha256", testConfig.webhookSecret)
                .update(body)
                .digest("hex");

            assert.equal(service.verifyWebhookSignature(body, signature), true);
        });
    });

    describe("4. Sandbox Refunds & Details", () => {
        it("should process mock refund in sandbox mode", async () => {
            const service = new RazorpayPaymentService(testConfig);
            const result = await service.refundPayment({
                paymentId: "pay_mock_123",
                amount: 250,
                currency: "INR",
                notes: { reason: "student requested cancellation" },
            });

            assert.ok(result.refundId.startsWith("rfnd_mock_"));
            assert.equal(result.paymentId, "pay_mock_123");
            assert.equal(result.amount, 250);
            assert.equal(result.status, "processed");
        });

        it("should fetch sandbox payment details", async () => {
            const service = new RazorpayPaymentService(testConfig);
            const details = await service.fetchPaymentDetails("pay_mock_456");

            assert.ok(details);
            assert.equal(details.paymentId, "pay_mock_456");
            assert.equal(details.status, "captured");
        });
    });
});

