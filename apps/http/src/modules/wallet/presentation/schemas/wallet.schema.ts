import { z } from "zod";

export const createTopUpOrderSchema = z.object({
  amount: z.coerce
    .number()
    .min(10, "Minimum top-up amount is ₹10")
    .max(100000, "Maximum single top-up amount is ₹1,00,000"),
});

export const verifyTopUpPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1, "razorpayOrderId is required"),
  razorpayPaymentId: z.string().min(1, "razorpayPaymentId is required"),
  razorpaySignature: z.string().min(1, "razorpaySignature is required"),
});

export const requestPayoutSchema = z.object({
  amount: z.coerce
    .number()
    .min(500, "Minimum withdrawal amount is ₹500")
    .max(1000000, "Maximum single payout is ₹10,00,000"),
  bankDetailId: z.string().optional(),
});

export const adminProcessPayoutSchema = z.object({
  status: z.enum(["COMPLETED", "REJECTED", "PROCESSING"]),
  rejectionReason: z.string().optional(),
  transactionRef: z.string().optional(),
});

export const adminWalletAdjustmentSchema = z.object({
  userId: z.string().uuid("Invalid userId"),
  amount: z.coerce.number().positive("Adjustment amount must be positive"),
  direction: z.enum(["CREDIT", "DEBIT"]),
  reason: z.string().min(5, "Reason must be at least 5 characters long"),
});
