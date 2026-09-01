import { z } from "zod";

export const resetPasswordSchema = z.object({
    email: z
        .string({ message: "Email is required" })
        .trim()
        .toLowerCase()
        .email("Invalid email address"),

    otp: z
        .string({ message: "OTP is required" })
        .length(6, "OTP must be 6 digits")
        .regex(/^[0-9]{6}$/, "OTP must be a 6-digit number"),

    newPassword: z
        .string({ message: "New password is required" })
        .min(8, "Password must be at least 8 characters long")
        .max(100, "Password cannot exceed 100 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

export type ResetPasswordSchemaDTO = z.infer<typeof resetPasswordSchema>;
