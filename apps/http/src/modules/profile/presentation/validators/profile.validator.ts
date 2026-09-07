import { z } from "zod";
import { EXPERTISE_DOMAINS, type ExpertiseDomain } from "../../domain/enums/expertise.enum";

export { EXPERTISE_DOMAINS, type ExpertiseDomain };

const isValidUrl = (val: string) => {
    try {
        const url = new URL(val);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
};

const optionalUrl = (label: string) =>
    z
        .string()
        .trim()
        .refine((val) => val === "" || isValidUrl(val), {
            message: `${label} must be a valid URL (e.g. https://...)`,
        })
        .nullable()
        .optional();

export const updateProfileSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name cannot exceed 100 characters")
        .optional(),
    avatar: z
        .string()
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
    expertise: z
        .array(
            z.enum(EXPERTISE_DOMAINS, {
                errorMap: () => ({ message: "Expertise item must be a valid predefined domain" }),
            })
        )
        .max(15, "Cannot select more than 15 expertise domains")
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
    linkedinUrl: optionalUrl("LinkedIn URL"),
    twitterUrl: optionalUrl("Twitter/X URL"),
    websiteUrl: optionalUrl("Website URL"),
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
    expertise: z
        .array(
            z.enum(EXPERTISE_DOMAINS, {
                errorMap: () => ({ message: "Expertise item must be a valid predefined domain" }),
            })
        )
        .max(15, "Cannot select more than 15 expertise domains")
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
    linkedinUrl: optionalUrl("LinkedIn URL"),
    twitterUrl: optionalUrl("Twitter/X URL"),
    websiteUrl: optionalUrl("Website URL"),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateStudentProfileInput = z.infer<typeof updateStudentProfileSchema>;
export type UpdateTeacherProfileInput = z.infer<typeof updateTeacherProfileSchema>;
