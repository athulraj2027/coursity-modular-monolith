import { z } from "zod";

export const updateProfileSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name cannot exceed 100 characters")
        .optional(),
    avatar: z
        .string()
        .url("Avatar must be a valid URL")
        .nullable()
        .optional()
        .or(z.literal("")),
    bio: z
        .string()
        .max(1000, "Bio cannot exceed 1000 characters")
        .nullable()
        .optional(),
    phone: z
        .string()
        .max(20, "Phone number cannot exceed 20 characters")
        .nullable()
        .optional(),
    headline: z
        .string()
        .max(150, "Headline cannot exceed 150 characters")
        .nullable()
        .optional(),
    education: z
        .string()
        .max(255, "Education cannot exceed 255 characters")
        .nullable()
        .optional(),
    interests: z
        .array(z.string().trim().min(1, "Interest cannot be empty"))
        .optional(),
    expertise: z
        .array(z.string().trim().min(1, "Expertise item cannot be empty"))
        .optional(),
    qualifications: z
        .string()
        .max(500, "Qualifications cannot exceed 500 characters")
        .nullable()
        .optional(),
    experienceYears: z
        .coerce
        .number()
        .int("Experience years must be an integer")
        .min(0, "Experience years cannot be negative")
        .max(80, "Experience years cannot exceed 80")
        .nullable()
        .optional(),
    linkedinUrl: z
        .string()
        .url("LinkedIn URL must be a valid URL")
        .nullable()
        .optional()
        .or(z.literal("")),
    twitterUrl: z
        .string()
        .url("Twitter URL must be a valid URL")
        .nullable()
        .optional()
        .or(z.literal("")),
    websiteUrl: z
        .string()
        .url("Website URL must be a valid URL")
        .nullable()
        .optional()
        .or(z.literal("")),
});

export const updateStudentProfileSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name cannot exceed 100 characters")
        .optional(),
    avatar: z
        .string()
        .url("Avatar must be a valid URL")
        .nullable()
        .optional()
        .or(z.literal("")),
    bio: z
        .string()
        .max(1000, "Bio cannot exceed 1000 characters")
        .nullable()
        .optional(),
    phone: z
        .string()
        .max(20, "Phone number cannot exceed 20 characters")
        .nullable()
        .optional(),
    headline: z
        .string()
        .max(150, "Headline cannot exceed 150 characters")
        .nullable()
        .optional(),
    education: z
        .string()
        .max(255, "Education cannot exceed 255 characters")
        .nullable()
        .optional(),
    interests: z
        .array(z.string().trim().min(1, "Interest cannot be empty"))
        .optional(),
});

export const updateTeacherProfileSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name cannot exceed 100 characters")
        .optional(),
    avatar: z
        .string()
        .url("Avatar must be a valid URL")
        .nullable()
        .optional()
        .or(z.literal("")),
    bio: z
        .string()
        .max(1000, "Bio cannot exceed 1000 characters")
        .nullable()
        .optional(),
    phone: z
        .string()
        .max(20, "Phone number cannot exceed 20 characters")
        .nullable()
        .optional(),
    headline: z
        .string()
        .max(150, "Headline cannot exceed 150 characters")
        .nullable()
        .optional(),
    expertise: z
        .array(z.string().trim().min(1, "Expertise item cannot be empty"))
        .optional(),
    qualifications: z
        .string()
        .max(500, "Qualifications cannot exceed 500 characters")
        .nullable()
        .optional(),
    experienceYears: z
        .coerce
        .number()
        .int("Experience years must be an integer")
        .min(0, "Experience years cannot be negative")
        .max(80, "Experience years cannot exceed 80")
        .nullable()
        .optional(),
    linkedinUrl: z
        .string()
        .url("LinkedIn URL must be a valid URL")
        .nullable()
        .optional()
        .or(z.literal("")),
    twitterUrl: z
        .string()
        .url("Twitter URL must be a valid URL")
        .nullable()
        .optional()
        .or(z.literal("")),
    websiteUrl: z
        .string()
        .url("Website URL must be a valid URL")
        .nullable()
        .optional()
        .or(z.literal("")),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateStudentProfileInput = z.infer<typeof updateStudentProfileSchema>;
export type UpdateTeacherProfileInput = z.infer<typeof updateTeacherProfileSchema>;
