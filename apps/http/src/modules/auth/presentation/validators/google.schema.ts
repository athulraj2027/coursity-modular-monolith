import { z } from "zod";

export const googleAuthSchema = z.object({
    idToken: z.string().optional(),
    credential: z.string().optional(),
    code: z.string().optional(),
    role: z.enum(["STUDENT", "TEACHER"]).optional().default("STUDENT"),
}).refine((data) => data.idToken || data.credential || data.code, {
    message: "Either idToken, credential, or code must be provided",
});

export const googleCallbackSchema = z.object({
    code: z.string({ message: "Authorization code is required" }).min(1, "Code cannot be empty"),
    role: z.enum(["STUDENT", "TEACHER"]).optional().default("STUDENT"),
});

export type GoogleAuthSchemaDTO = z.infer<typeof googleAuthSchema>;
export type GoogleCallbackSchemaDTO = z.infer<typeof googleCallbackSchema>;
