import { env } from "@/app/config/env";

export interface PaymentConfig {
    keyId: string;
    keySecret: string;
    webhookSecret: string;
}

export const paymentConfig: PaymentConfig = {
    keyId: env.RAZORPAY_KEY_ID || "",
    keySecret: env.RAZORPAY_KEY_SECRET || "",
    webhookSecret: env.RAZORPAY_WEBHOOK_SECRET || "",
};

