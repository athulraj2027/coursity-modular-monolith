import { z } from "zod";

export const signupSchema = z.object({
    name: z
        .string({ message: "Name is required" })
        .trim()
        .min(2, "Name must be at least 2 characters long")
        .max(50, "Name cannot exceed 50 characters"),

    email: z
        .string({ message: "Email is required" })
        .trim()
        .toLowerCase()
        .email("Invalid email address"),

    password: z
        .string({ message: "Password is required" })
        .min(8, "Password must be at least 8 characters long")
        .max(100, "Password cannot exceed 100 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),

    role: z
        .enum(["STUDENT", "TEACHER"])
        .optional()
        .default("STUDENT"),
});

export type SignupDTO = z.infer<typeof signupSchema>;
