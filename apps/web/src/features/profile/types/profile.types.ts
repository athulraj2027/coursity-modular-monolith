export type UserRole = "STUDENT" | "TEACHER" | "ADMIN"
export type AuthProvider = "LOCAL" | "GOOGLE"
export type ApprovalStatus = "PENDING" | "IN_PROGRESS" | "VERIFIED" | "REVOKED" | "REDO"

export interface UserProfileModel {
  id: string
  userId: string
  avatar: string | null
  bio: string | null
  phone: string | null
  createdAt: string
  updatedAt: string
}

export interface TeacherProfileModel {
  id: string
  profileId: string
  expertise: string[]
  qualifications: string | null
  experienceYears: number | null
  linkedinUrl: string | null
  twitterUrl: string | null
  websiteUrl: string | null
  isApproved: boolean
  approvalStatus: ApprovalStatus
  rejectionReason?: string | null
  submissionCount?: number
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
