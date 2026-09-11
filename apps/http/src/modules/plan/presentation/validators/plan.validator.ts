import { z } from "zod";

export const billingCycleEnum = z.enum(["MONTHLY", "QUARTERLY", "YEARLY", "LIFETIME"]);

export const planFeatureInputSchema = z.object({
  featureId: z.string().min(1, "Feature ID is required"),
  value: z.string().min(1, "Feature value is required"),
  isUnlimited: z.boolean().optional(),
});

export const createPlanSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase alphanumeric characters and hyphens"),
  tagline: z.string().max(255).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  currency: z.string().min(3).max(3).default("USD"),
  billingCycle: billingCycleEnum.default("MONTHLY"),
  trialDays: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
  features: z.array(planFeatureInputSchema).optional(),
});

export const updatePlanSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase alphanumeric characters and hyphens")
    .optional(),
  tagline: z.string().max(255).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  price: z.coerce.number().min(0).optional(),
  currency: z.string().min(3).max(3).optional(),
  billingCycle: billingCycleEnum.optional(),
  trialDays: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
  features: z.array(planFeatureInputSchema).optional(),
});

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
