import { z } from "zod";

export const discountTypeEnum = z.enum(["PERCENTAGE", "FLAT"]);
export const eligibilityEnum = z.enum(["ALL_TEACHERS", "NEW_TEACHERS_ONLY"]);
export const billingCycleEnum = z.enum(["MONTHLY", "QUARTERLY", "YEARLY", "LIFETIME"]);

export const getPlanOfferQuerySchema = z.object({
  planId: z.string().min(1, "Plan ID is required"),
  billingCycle: billingCycleEnum.optional().default("MONTHLY"),
  offerId: z.string().optional(),
});

export const getPlanOfferSchema = z.object({
  query: getPlanOfferQuerySchema,
});

export type GetPlanOfferQuery = z.infer<typeof getPlanOfferQuerySchema>;

export const createOfferBodySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(120),
  description: z.string().max(500).optional().nullable(),
  discountType: discountTypeEnum.default("PERCENTAGE"),
  discountValue: z.coerce.number().min(0.01, "Discount value must be greater than 0"),
  maxDiscountAmount: z.coerce.number().min(0).optional().nullable(),
  minOrderAmount: z.coerce.number().min(0).optional().nullable(),
  eligibility: eligibilityEnum.default("ALL_TEACHERS"),
  badgeText: z.string().max(50).optional().nullable(),
  maxRedemptions: z.coerce.number().int().min(1).optional().nullable(),
  maxRedemptionsPerUser: z.coerce.number().int().min(1).default(1),
  validFrom: z.string().optional(),
  validUntil: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  applicablePlanIds: z.array(z.string()).optional(),
  applicableCycles: z.array(billingCycleEnum).optional(),
});

export const createOfferSchema = z.object({
  body: createOfferBodySchema,
});

export type CreateOfferBody = z.infer<typeof createOfferBodySchema>;

export const updateOfferBodySchema = z.object({
  title: z.string().min(3).max(120).optional(),
  description: z.string().max(500).optional().nullable(),
  discountType: discountTypeEnum.optional(),
  discountValue: z.coerce.number().min(0.01).optional(),
  maxDiscountAmount: z.coerce.number().min(0).optional().nullable(),
  minOrderAmount: z.coerce.number().min(0).optional().nullable(),
  eligibility: eligibilityEnum.optional(),
  badgeText: z.string().max(50).optional().nullable(),
  maxRedemptions: z.coerce.number().int().min(1).optional().nullable(),
  maxRedemptionsPerUser: z.coerce.number().int().min(1).optional(),
  validFrom: z.string().optional(),
  validUntil: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  applicablePlanIds: z.array(z.string()).optional(),
  applicableCycles: z.array(billingCycleEnum).optional(),
});

export const updateOfferSchema = z.object({
  body: updateOfferBodySchema,
});

export type UpdateOfferBody = z.infer<typeof updateOfferBodySchema>;

export const listOffersQueryObjectSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default(1),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default(10),
  search: z.string().optional(),
  status: z.enum(["all", "active", "disabled", "expired"]).optional().default("all"),
  discountType: z.enum(["all", "PERCENTAGE", "FLAT"]).optional().default("all"),
  sortBy: z.string().optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const listOffersQuerySchema = z.object({
  query: listOffersQueryObjectSchema,
});

export type ListOffersQuery = z.infer<typeof listOffersQueryObjectSchema>;
