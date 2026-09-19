import { z } from "zod";
import { EXPERTISE_DOMAINS, type ExpertiseDomain } from "../../domain/enums/expertise.enum";

export { EXPERTISE_DOMAINS, type ExpertiseDomain };

const isValidUrl = (val: string) => {
    try {
        const url = new URL(val);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        try {
            const withHttps = new URL(`https://${val}`);
            return withHttps.protocol === "https:" && val.includes(".");
        } catch {
            return false;
        }
    }
};

const optionalUrl = (label: string) =>
    z
        .string()
        .trim()
        .refine((val) => val === "" || val.startsWith("/") || isValidUrl(val), {
            message: `${label} must be a valid URL (e.g. https://...)`,
        })
        .nullable()
        .optional();

export const qualificationItemValidator = z.object({
    title: z
        .string()
        .trim()
        .min(1, "Degree, course, or job title is required")
        .max(150, "Title cannot exceed 150 characters"),
    institution: z
        .string()
        .trim()
        .max(150, "Institution cannot exceed 150 characters")
        .nullable()
        .optional()
        .or(z.literal("")),
    year: z
        .string()
        .trim()
        .min(1, "Year or duration is required")
        .max(50, "Year cannot exceed 50 characters"),
});

export const qualificationsFieldValidator = z
    .union([
        z.array(qualificationItemValidator).max(20, "Cannot add more than 20 qualification entries"),
        z.array(z.string().max(300)).max(20),
        z.string().max(2000),
    ])
    .nullable()
    .optional();

export const updateProfileSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name cannot exceed 50 characters")
        .optional(),
    avatar: z
        .string()
        .trim()
        .refine((val) => val === "" || val.startsWith("/") || isValidUrl(val), {
            message: "Avatar must be a valid URL",
        })
        .nullable()
        .optional()
        .or(z.literal("")),
    bio: z
        .string()
        .max(500, "Bio cannot exceed 500 characters")
        .nullable()
        .optional(),
    phone: z
        .string()
        .regex(/^\+?[1-9]\d{1,14}$/, "Phone number must be in international format (E.164)")
        .nullable()
        .optional(),
    country: z
        .string()
        .trim()
        .max(100, "Country cannot exceed 100 characters")
        .nullable()
        .optional(),
    expertise: z
        .array(
            z.enum(EXPERTISE_DOMAINS, {
                message: "Expertise item must be a valid predefined domain",
            })
        )
        .max(15, "Cannot select more than 15 expertise domains")
        .optional(),
    qualifications: qualificationsFieldValidator,
    experienceYears: z
        .coerce
        .number()
        .int("Experience years must be an integer")
        .min(0, "Experience years cannot be negative")
        .max(80, "Experience years cannot exceed 80")
        .nullable()
        .optional(),
    resume: z
        .string()
        .max(1000, "Resume URL cannot exceed 1000 characters")
        .nullable()
        .optional()
        .or(z.literal("")),
    credentials: z
        .array(
            z.string().trim().refine((val) => val === "" || val.startsWith("/") || isValidUrl(val), {
                message: "Each credential must be a valid URL",
            })
        )
        .max(20, "Cannot upload more than 20 credential certificates")
        .optional(),
    identityCard: optionalUrl("Identity Card URL"),
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
    country: z
        .string()
        .trim()
        .max(100, "Country cannot exceed 100 characters")
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
    country: z
        .string()
        .trim()
        .max(100, "Country cannot exceed 100 characters")
        .nullable()
        .optional(),
    expertise: z
        .array(
            z.enum(EXPERTISE_DOMAINS, {
                message: "Expertise item must be a valid predefined domain",
            })
        )
        .max(15, "Cannot select more than 15 expertise domains")
        .optional(),
    qualifications: qualificationsFieldValidator,
    experienceYears: z
        .coerce
        .number()
        .int("Experience years must be an integer")
        .min(0, "Experience years cannot be negative")
        .max(80, "Experience years cannot exceed 80")
        .nullable()
        .optional(),
    resume: z
        .string()
        .max(1000, "Resume URL cannot exceed 1000 characters")
        .nullable()
        .optional()
        .or(z.literal("")),
    credentials: z
        .array(
            z.string().trim().refine((val) => val === "" || val.startsWith("/") || isValidUrl(val), {
                message: "Each credential must be a valid URL",
            })
        )
        .max(20, "Cannot upload more than 20 credential certificates")
        .optional(),
    identityCard: optionalUrl("Identity Card URL"),
    linkedinUrl: optionalUrl("LinkedIn URL"),
    twitterUrl: optionalUrl("Twitter/X URL"),
    websiteUrl: optionalUrl("Website URL"),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateStudentProfileInput = z.infer<typeof updateStudentProfileSchema>;
export type UpdateTeacherProfileInput = z.infer<typeof updateTeacherProfileSchema>;
