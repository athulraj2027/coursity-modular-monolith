import type { UserRole, AuthProvider } from "./user-management.types"

export interface StudentProfileModel {
  id: string
  userId: string
  avatar: string | null
  bio: string | null
  phone: string | null
  headline: string | null
  education: string | null
  interests: string[]
  createdAt: string
  updatedAt: string
}

export interface TeacherProfileModel {
  id: string
  userId: string
  avatar: string | null
  bio: string | null
  phone: string | null
  headline: string | null
  expertise: string[]
  qualifications: string | null
  experienceYears: number | null
  linkedinUrl: string | null
  twitterUrl: string | null
  websiteUrl: string | null
  isApproved: boolean
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
  studentProfile?: StudentProfileModel | null
  teacherProfile?: TeacherProfileModel | null
  createdAt: string
  updatedAt: string
}
