import { z } from "zod";

export const signinSchema = z.object({
    email: z
        .string({ message: "Email is required" })
        .trim()
        .toLowerCase()
        .email("Invalid email address"),

    password: z
        .string({ message: "Password is required" })
        .min(1, "Password is required"),
});

export type SigninSchemaDTO = z.infer<typeof signinSchema>;
