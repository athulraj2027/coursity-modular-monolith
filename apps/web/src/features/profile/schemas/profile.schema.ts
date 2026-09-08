import { z } from "zod"
import { ALL_EXPERTISE_TAGS } from "../constants/expertise.constants"

export const isValidHttpUrl = (val: string): boolean => {
  const trimmed = val.trim()
  if (!trimmed) return true
  try {
    const parsed = new URL(trimmed)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
  } catch {
    return false
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
      (val) =>
        val === "" ||
        isValidHttpUrl(val) ||
        val.startsWith("data:") ||
        val.startsWith("blob:"),
      {
        message: "Avatar must be a valid image URL",
      }
    )
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .trim()
    .max(20, "Phone number cannot exceed 20 characters")
    .optional()
    .or(z.literal("")),
  bio: z
    .string()
    .trim()
    .max(1000, "Biography cannot exceed 1000 characters")
    .optional()
    .or(z.literal("")),
})

export type StudentProfileInput = z.infer<typeof studentProfileSchema>

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
      (val) =>
        val === "" ||
        isValidHttpUrl(val) ||
        val.startsWith("data:") ||
        val.startsWith("blob:"),
      {
        message: "Avatar must be a valid image URL",
      }
    )
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .trim()
    .max(20, "Phone number cannot exceed 20 characters")
    .optional()
    .or(z.literal("")),
  bio: z
    .string()
    .trim()
    .max(1000, "Biography cannot exceed 1000 characters")
    .optional()
    .or(z.literal("")),
  qualifications: z
    .string()
    .trim()
    .max(500, "Qualifications cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
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
  linkedinUrl: optionalUrl("LinkedIn URL"),
  twitterUrl: optionalUrl("Twitter/X URL"),
  websiteUrl: optionalUrl("Website URL"),
  expertise: z
    .array(
      z.string().refine((t) => ALL_EXPERTISE_TAGS.includes(t), {
        message: "Invalid domain of expertise selected",
      })
    )
    .max(15, "You can select up to 15 domains of expertise")
    .optional()
    .default([]),
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
