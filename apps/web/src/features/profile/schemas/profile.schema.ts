import { z } from "zod"
import { ALL_EXPERTISE_TAGS } from "../constants/expertise.constants"

export const isValidHttpUrl = (val: string): boolean => {
  const trimmed = val.trim()
  if (!trimmed) return true
  if (trimmed.startsWith("/") || trimmed.startsWith("data:") || trimmed.startsWith("blob:")) return true
  try {
    const parsed = new URL(trimmed)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
  } catch {
    try {
      const parsedWithHttps = new URL(`https://${trimmed}`)
      return parsedWithHttps.protocol === "https:" && trimmed.includes(".")
    } catch {
      return false
    }
  }
}

const optionalUrl = (label: string) =>
  z
    .string()
    .trim()
    .refine((val) => val === "" || isValidHttpUrl(val), {
      message: `${label} must be a valid URL (e.g. https://...)`,
    })
    .optional()
    .nullable()
    .or(z.literal(""))

export const studentProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name cannot exceed 100 characters"),
  avatar: z
    .string()
    .trim()
    .refine(
      (val) => val === "" || isValidHttpUrl(val),
      {
        message: "Avatar must be a valid image URL",
      }
    )
    .optional()
    .nullable()
    .or(z.literal("")),
  country: z
    .string()
    .trim()
    .min(1, "Country is required")
    .max(100, "Country cannot exceed 100 characters"),
  phone: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .min(5, "Phone number must be at least 5 digits")
    .max(25, "Phone number cannot exceed 25 characters"),
  bio: z
    .string()
    .trim()
    .min(1, "Biography is required")
    .min(10, "Biography must be at least 10 characters")
    .max(1000, "Biography cannot exceed 1000 characters"),
})

export type StudentProfileInput = z.infer<typeof studentProfileSchema>

export const qualificationItemSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Degree, course, or job title is required")
    .max(150, "Title cannot exceed 150 characters"),
  institution: z
    .string()
    .trim()
    .max(150, "Institution cannot exceed 150 characters")
    .optional()
    .default(""),
  year: z
    .string()
    .trim()
    .min(1, "Year or duration is required (e.g. 2022 or 2018-2022)")
    .max(50, "Year cannot exceed 50 characters"),
})

export type QualificationItemInput = z.infer<typeof qualificationItemSchema>

export const teacherProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Display name is required")
    .min(2, "Display name must be at least 2 characters")
    .max(100, "Display name cannot exceed 100 characters"),
  avatar: z
    .string()
    .trim()
    .refine(
      (val) => val === "" || isValidHttpUrl(val),
      {
        message: "Avatar must be a valid image URL",
      }
    )
    .optional()
    .nullable()
    .or(z.literal("")),
  country: z
    .string()
    .trim()
    .min(1, "Country is required")
    .max(100, "Country cannot exceed 100 characters"),
  phone: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .min(5, "Phone number must be at least 5 digits")
    .max(25, "Phone number cannot exceed 25 characters"),
  bio: z
    .string()
    .trim()
    .min(1, "Biography is required")
    .min(10, "Biography must be at least 10 characters")
    .max(1000, "Biography cannot exceed 1000 characters"),
  qualifications: z
    .array(qualificationItemSchema)
    .min(1, "At least one qualification or experience entry is required")
    .max(20, "Cannot add more than 20 qualification entries"),
  experienceYears: z
    .union([z.number(), z.string()])
    .transform((val) => {
      if (typeof val === "string") {
        const trimmed = val.trim()
        return trimmed === "" ? 0 : Number(trimmed)
      }
      return val
    })
    .refine((val) => !isNaN(val), {
      message: "Experience years must be a valid number",
    })
    .refine((val) => Number.isInteger(val), {
      message: "Experience years must be a whole number",
    })
    .refine((val) => val >= 0, {
      message: "Experience years cannot be negative",
    })
    .refine((val) => val <= 80, {
      message: "Experience years cannot exceed 80",
    })
    .default(0),
  resume: z
    .string()
    .trim()
    .min(1, "Resume (CV) document is required")
    .refine(
      (val) => isValidHttpUrl(val),
      {
        message: "Resume must be a valid document URL",
      }
    ),
  credentials: z
    .array(
      z.string().trim().refine((val) => isValidHttpUrl(val), {
        message: "Certificate URL must be valid",
      })
    )
    .min(1, "Please upload at least 1 certificate / credential")
    .max(20, "You can upload up to 20 certificates"),
  identityCard: z
    .string()
    .trim()
    .min(1, "Government identity document (PAN / National ID) is required")
    .refine(
      (val) => isValidHttpUrl(val),
      {
        message: "Identity card must be a valid document URL",
      }
    ),
  expertise: z
    .array(
      z.string().refine((t) => ALL_EXPERTISE_TAGS.includes(t), {
        message: "Invalid domain of expertise selected",
      })
    )
    .min(1, "Please select at least 1 domain of expertise")
    .max(15, "You can select up to 15 domains of expertise"),
  linkedinUrl: optionalUrl("LinkedIn URL"),
  twitterUrl: optionalUrl("Twitter/X URL"),
  websiteUrl: optionalUrl("Website URL"),
})

export type TeacherProfileInput = z.infer<typeof teacherProfileSchema>

export const verifyTeacherSchema = z
  .object({
    approvalStatus: z.enum([
      "PENDING",
      "IN_PROGRESS",
      "VERIFIED",
      "REVOKED",
      "REDO",
    ]),
    isApproved: z.boolean(),
    rejectionReason: z.string().trim().optional().nullable().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.approvalStatus === "REVOKED" || data.approvalStatus === "REDO") {
        const reason = data.rejectionReason?.trim() || ""
        return reason.length >= 5 && reason.length <= 1000
      }
      return true
    },
    {
      message: "Please provide actionable feedback / reason (5-1000 characters).",
      path: ["rejectionReason"],
    }
  )

export type VerifyTeacherInput = z.infer<typeof verifyTeacherSchema>

export function validateStudentForm<T extends Record<string, any>>(
  data: T
): Partial<Record<keyof T, string>> {
  const result = studentProfileSchema.safeParse(data)
  if (result.success) return {}

  const errors: Partial<Record<keyof T, string>> = {}
  result.error.issues.forEach((issue) => {
    const field = issue.path[0] as keyof T
    if (field && !errors[field]) {
      errors[field] = issue.message
    }
  })
  return errors
}

export function validateTeacherForm<T extends Record<string, any>>(
  data: T
): Partial<Record<keyof T, string>> {
  const result = teacherProfileSchema.safeParse(data)
  if (result.success) return {}

  const errors: Partial<Record<keyof T, string>> = {}
  result.error.issues.forEach((issue) => {
    const field = issue.path[0] as keyof T
    if (field && !errors[field]) {
      errors[field] = issue.message
    }
  })
  return errors
}
