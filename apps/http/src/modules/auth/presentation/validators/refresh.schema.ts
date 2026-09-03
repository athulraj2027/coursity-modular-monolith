import { z } from "zod";

export const refreshSchema = z.object({
    refreshToken: z.string().optional(),
});

export type RefreshSchemaDTO = z.infer<typeof refreshSchema>;
