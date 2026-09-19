export type UserRole = "STUDENT" | "TEACHER" | "ADMIN"
export type AuthProvider = "LOCAL" | "GOOGLE"
export type ApprovalStatus = "PENDING" | "IN_PROGRESS" | "VERIFIED" | "REVOKED" | "REDO"

export interface UserProfileModel {
  id: string
  userId: string
  avatar: string | null
  bio: string | null
  phone: string | null
  country: string | null
  createdAt: string
  updatedAt: string
}

export interface QualificationItem {
  title: string
  institution?: string | null
  year: string
}

export function normalizeQualifications(raw: any): QualificationItem[] {
  if (!raw) return []
  if (Array.isArray(raw)) {
    const results: QualificationItem[] = []
    for (const item of raw) {
      if (typeof item === "string") {
        const trimmed = item.trim()
        if (trimmed) {
          results.push({ title: trimmed, institution: null, year: "" })
        }
      } else if (typeof item === "object" && item !== null) {
        const title = String(item.title || "").trim()
        if (title) {
          results.push({
            title,
            institution: item.institution ? String(item.institution).trim() : null,
            year: String(item.year || "").trim(),
          })
        }
      }
    }
    return results
  }
  if (typeof raw === "string" && raw.trim()) {
    return [{ title: raw.trim(), institution: null, year: "" }]
  }
  return []
}

export interface TeacherProfileModel {
  id: string
  profileId: string
  expertise: string[]
  qualifications: QualificationItem[] | string | null
  experienceYears: number | null
  resume?: string | null
  credentials?: string[]
  identityCard?: string | null
  linkedinUrl: string | null
  twitterUrl: string | null
  websiteUrl: string | null
  isApproved: boolean
  approvalStatus: ApprovalStatus
  rejectionReason?: string | null
  submissionCount?: number
  isInterviewPassed?: boolean
  interviewScore?: number | null
  interviewFeedback?: string | null
  interviewAttempts?: number
  lastInterviewAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface FullUserProfileResponse {
  id: string
  name: string
  email: string
  role: UserRole
  authProvider: AuthProvider
  isBlocked: boolean
  profile?: UserProfileModel | null
  teacherProfile?: TeacherProfileModel | null
  createdAt: string
  updatedAt: string
}
