import { z } from "zod";

// ==========================================
// DIRECT BODY SCHEMAS (for controller validation)
// ==========================================

export const createCourseCheckoutOrderSchema = z.object({
  courseId: z.string().uuid("Invalid course ID"),
  couponCode: z.string().trim().optional(),
  useWalletBalance: z.boolean().optional().default(false),
});

export const verifyCoursePaymentSchema = z.object({
  courseId: z.string().uuid("Invalid course ID"),
  razorpayOrderId: z.string().min(1, "Order ID is required"),
  razorpayPaymentId: z.string().min(1, "Payment ID is required"),
  razorpaySignature: z.string().min(1, "Signature is required"),
  couponCode: z.string().trim().optional(),
  walletDeductionAmount: z.number().nonnegative().optional().default(0),
});

export const payWithWalletSchema = z.object({
  courseId: z.string().uuid("Invalid course ID"),
  couponCode: z.string().trim().optional(),
});

export const enrollFreeCourseSchema = z.object({
  courseId: z.string().uuid("Invalid course ID"),
});

export const updateLessonProgressSchema = z.object({
  lessonId: z.string().uuid("Invalid lesson ID"),
  isCompleted: z.boolean().optional(),
  lastPositionSeconds: z.number().int().nonnegative().optional(),
});

export const markClassAttendanceSchema = z.object({
  lessonId: z.string().uuid("Invalid lesson ID"),
  liveAttendanceMinutes: z.number().int().positive().optional().default(30),
});

export const requestCourseRefundSchema = z.object({
  reason: z.string().min(5, "Reason must be at least 5 characters").max(500),
  destination: z.enum(["WALLET", "ORIGINAL_PAYMENT_METHOD"]).default("WALLET"),
});

// ==========================================
// WRAPPER SCHEMAS (for Express validate middleware compatibility)
// ==========================================

export const CreateCourseCheckoutOrderSchema = z.object({
  body: createCourseCheckoutOrderSchema,
});

export const VerifyCoursePaymentSchema = z.object({
  body: verifyCoursePaymentSchema,
});

export const PayWithWalletSchema = z.object({
  body: payWithWalletSchema,
});

export const EnrollFreeCourseSchema = z.object({
  body: enrollFreeCourseSchema,
});

export const UpdateLessonProgressSchema = z.object({
  body: updateLessonProgressSchema,
});

export const MarkClassAttendanceSchema = z.object({
  body: markClassAttendanceSchema,
});

export const RequestCourseRefundSchema = z.object({
  body: requestCourseRefundSchema,
});

// Inferred Types
export type CreateCourseCheckoutOrderInput = z.infer<typeof createCourseCheckoutOrderSchema>;
export type VerifyCoursePaymentInput = z.infer<typeof verifyCoursePaymentSchema>;
export type PayWithWalletInput = z.infer<typeof payWithWalletSchema>;
export type EnrollFreeCourseInput = z.infer<typeof enrollFreeCourseSchema>;
export type UpdateLessonProgressInput = z.infer<typeof updateLessonProgressSchema>;
export type MarkClassAttendanceInput = z.infer<typeof markClassAttendanceSchema>;
export type RequestCourseRefundInput = z.infer<typeof requestCourseRefundSchema>;
