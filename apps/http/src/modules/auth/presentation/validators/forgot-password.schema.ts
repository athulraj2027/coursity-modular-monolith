import { z } from "zod";

export const forgotPasswordSchema = z.object({
    email: z
        .string({ message: "Email is required" })
        .trim()
        .toLowerCase()
        .email("Invalid email address"),

    role: z.enum(["STUDENT", "TEACHER", "ADMIN"]).optional(),
});

export type ForgotPasswordSchemaDTO = z.infer<typeof forgotPasswordSchema>;
