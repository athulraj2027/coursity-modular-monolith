import { z } from "zod";

export const updateProfileSchema = z.object({
    name: z
        .string({ message: "Name is required" })
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name cannot exceed 100 characters"),
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().optional(),
    newPassword: z
        .string({ message: "New password is required" })
        .min(6, "Password must be at least 6 characters")
        .max(100, "Password too long"),
});

export const getUsersQuerySchema = z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
    search: z.string().optional(),
    role: z.enum(["STUDENT", "TEACHER", "ADMIN"]).optional(),
    authProvider: z.enum(["LOCAL", "GOOGLE"]).optional(),
    isApproved: z
        .preprocess((val) => {
            if (val === "true" || val === true || val === "1" || val === 1 || val === "approved" || val === "verified") return true;
            if (val === "false" || val === false || val === "0" || val === 0 || val === "pending" || val === "unapproved") return false;
            return undefined;
        }, z.boolean().optional())
        .optional(),
    sortBy: z.enum(["createdAt", "name", "email"]).optional().default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const approveTeacherSchema = z.object({
    isApproved: z.boolean().optional().default(true),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type GetUsersQueryInput = z.infer<typeof getUsersQuerySchema>;
export type ApproveTeacherInput = z.infer<typeof approveTeacherSchema>;
