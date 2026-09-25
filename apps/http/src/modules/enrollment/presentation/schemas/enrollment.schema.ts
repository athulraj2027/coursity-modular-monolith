import { z } from "zod";

export const CreateCourseCheckoutOrderSchema = z.object({
  body: z.object({
    courseId: z.string().uuid("Invalid course ID"),
    couponCode: z.string().optional(),
    useWalletBalance: z.boolean().optional().default(false),
  }),
});

export const VerifyCoursePaymentSchema = z.object({
  body: z.object({
    courseId: z.string().uuid("Invalid course ID"),
    razorpayOrderId: z.string().min(1, "Order ID is required"),
    razorpayPaymentId: z.string().min(1, "Payment ID is required"),
    razorpaySignature: z.string().min(1, "Signature is required"),
    couponCode: z.string().optional(),
    walletDeductionAmount: z.number().optional().default(0),
  }),
});

export const PayWithWalletSchema = z.object({
  body: z.object({
    courseId: z.string().uuid("Invalid course ID"),
    couponCode: z.string().optional(),
  }),
});

export const EnrollFreeCourseSchema = z.object({
  body: z.object({
    courseId: z.string().uuid("Invalid course ID"),
  }),
});

export const UpdateLessonProgressSchema = z.object({
  body: z.object({
    lessonId: z.string().uuid("Invalid lesson ID"),
    isCompleted: z.boolean().optional(),
    lastPositionSeconds: z.number().int().nonnegative().optional(),
  }),
});

export const MarkClassAttendanceSchema = z.object({
  body: z.object({
    lessonId: z.string().uuid("Invalid lesson ID"),
    liveAttendanceMinutes: z.number().int().positive().optional().default(30),
  }),
});

export const RequestCourseRefundSchema = z.object({
  body: z.object({
    reason: z.string().min(5, "Reason must be at least 5 characters").max(500),
    destination: z.enum(["WALLET", "ORIGINAL_PAYMENT_METHOD"]).default("WALLET"),
  }),
});
