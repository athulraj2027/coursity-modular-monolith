import { z } from "zod";

export const verifySignupSchema = z.object({
    otp: z
        .string({ message: "OTP is required" })
        .length(6, "OTP must be 6 digits")
        .regex(/^[0-9]{6}$/, "OTP must be a 6-digit number"),

    email: z
        .string({ message: "Email is required" })
        .email("Email is invalid"),
});

export type VerifySignupDTO = z.infer<typeof verifySignupSchema>;