import { z } from "zod";

export const resendOtpSchema = z.object({
    email: z
        .string({ message: "Email is required" })
        .trim()
        .toLowerCase()
        .email("Invalid email address"),
});

export type ResendOtpDTO = z.infer<typeof resendOtpSchema>;
