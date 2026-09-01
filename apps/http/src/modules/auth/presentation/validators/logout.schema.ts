import { z } from "zod";

export const logoutSchema = z.object({
    refreshToken: z
        .string()
        .optional(),
    userId: z
        .string()
        .optional(),
});

export type LogoutSchemaDTO = z.infer<typeof logoutSchema>;
