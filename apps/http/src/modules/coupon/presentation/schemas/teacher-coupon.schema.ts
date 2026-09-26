import { z } from "zod";

export const CreateTeacherCouponSchema = z.object({
  body: z.object({
    code: z
      .string()
      .min(3, "Coupon code must be at least 3 characters")
      .max(20, "Coupon code cannot exceed 20 characters")
      .regex(/^[A-Za-z0-9_-]+$/, "Coupon code can only contain letters, numbers, hyphens, and underscores"),
    description: z.string().max(255).optional(),
    discountType: z.enum(["PERCENTAGE", "FLAT"]),
    discountValue: z.number().positive("Discount value must be positive"),
    maxDiscountAmount: z.number().positive().optional(),
    minOrderAmount: z.number().positive().optional(),
    courseId: z.string().uuid().optional(),
    maxUses: z.number().int().positive().optional(),
    maxUsesPerStudent: z.number().int().positive().default(1),
    validFrom: z.string().datetime().optional().transform((v) => (v ? new Date(v) : undefined)),
    expiresAt: z.string().datetime().optional().transform((v) => (v ? new Date(v) : undefined)),
    isActive: z.boolean().default(true),
  }),
});

export const UpdateTeacherCouponSchema = z.object({
  body: z.object({
    description: z.string().max(255).optional(),
    discountType: z.enum(["PERCENTAGE", "FLAT"]).optional(),
    discountValue: z.number().positive().optional(),
    maxDiscountAmount: z.number().positive().nullable().optional(),
    minOrderAmount: z.number().positive().nullable().optional(),
    courseId: z.string().uuid().nullable().optional(),
    maxUses: z.number().int().positive().nullable().optional(),
    maxUsesPerStudent: z.number().int().positive().optional(),
    validFrom: z.string().datetime().optional().transform((v) => (v ? new Date(v) : undefined)),
    expiresAt: z.string().datetime().nullable().optional().transform((v) => (v ? new Date(v) : null)),
    isActive: z.boolean().optional(),
  }),
});

export const ValidateCouponQuerySchema = z.object({
  query: z.object({
    code: z.string().min(1, "Coupon code is required"),
    courseId: z.string().uuid("Invalid course ID"),
  }),
});
