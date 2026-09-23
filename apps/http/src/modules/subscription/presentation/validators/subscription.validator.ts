import { z } from "zod";

export const billingCycleEnum = z.enum(["MONTHLY", "QUARTERLY", "YEARLY", "LIFETIME"]);

export const subscribePlanSchema = z.object({
  planId: z.string().min(1, "Plan ID is required"),
  paymentMethod: z.string().optional(),
  externalCustomerId: z.string().optional(),
  externalSubscriptionId: z.string().optional(),
});

export const recordUsageSchema = z.object({
  featureCode: z.string().min(1, "Feature code is required"),
  incrementBy: z.coerce.number().optional(),
  setAbsoluteValue: z.coerce.number().optional(),
});

export const checkQuotaQuerySchema = z.object({
  featureCode: z.string().min(1, "Feature code is required"),
  amount: z.coerce.number().optional().default(1),
});

export const createRazorpayOrderSchema = z.object({
  planId: z.string().min(1, "Plan ID is required"),
  billingCycle: billingCycleEnum.optional().default("MONTHLY"),
  offerId: z.string().optional(),
  phone: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional().default("India"),
  gstin: z.string().optional(),
});

export const verifyRazorpayPaymentSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  paymentId: z.string().min(1, "Payment ID is required"),
  signature: z.string().min(1, "Signature is required"),
  planId: z.string().min(1, "Plan ID is required"),
  billingCycle: billingCycleEnum.optional().default("MONTHLY"),
  offerId: z.string().optional(),
  phone: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional().default("India"),
  gstin: z.string().optional(),
});

export const adminSubscriptionQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  status: z.enum(["ACTIVE", "PAST_DUE", "CANCELED", "EXPIRED", "PENDING", "ALL"]).optional(),
  planId: z.string().optional(),
  billingCycle: billingCycleEnum.optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const adminCancelSubscriptionSchema = z.object({
  immediate: z.boolean().optional().default(false),
  reason: z.string().max(500).optional(),
});

export const adminRefundSubscriptionSchema = z.object({
  invoiceId: z.string().min(1, "Invoice ID is required"),
  amount: z.coerce.number().min(1, "Refund amount must be greater than 0").optional(),
  reason: z.string().min(3, "Refund reason is required").max(500),
  cancelSubscriptionImmediately: z.boolean().optional().default(false),
});

export const adminExtendSubscriptionSchema = z.object({
  daysToAdd: z.coerce.number().int().min(1).optional(),
  newPeriodEnd: z.string().datetime().optional(),
  reason: z.string().max(500).optional(),
});

export const adminChangeSubscriptionPlanSchema = z.object({
  newPlanId: z.string().min(1, "New Plan ID is required"),
  resetPeriod: z.boolean().optional().default(false),
});
