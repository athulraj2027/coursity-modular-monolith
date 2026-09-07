export type UserRole = "STUDENT" | "TEACHER" | "ADMIN"
export type AuthProvider = "LOCAL" | "GOOGLE"

export interface BackendTeacherProfile {
  id: string
  expertise: string[]
  qualifications?: string | null
  experienceYears?: number | null
  linkedinUrl?: string | null
  twitterUrl?: string | null
  websiteUrl?: string | null
  isApproved: boolean
  createdAt?: string
  updatedAt?: string
}

export interface BackendUserProfile {
  id: string
  avatar?: string | null
  bio?: string | null
  phone?: string | null
  teacherProfile?: BackendTeacherProfile | null
  createdAt?: string
  updatedAt?: string
}

export interface BackendUser {
  id: string
  name: string
  email: string
  role: UserRole
  authProvider: AuthProvider
  isBlocked: boolean
  createdAt: string
  updatedAt: string
  profile?: BackendUserProfile | null
}

export interface GetUsersParams {
  page?: number
  limit?: number
  search?: string
  role?: UserRole
  authProvider?: AuthProvider
  isBlocked?: boolean
  isApproved?: boolean
  sortBy?: "createdAt" | "name" | "email"
  sortOrder?: "asc" | "desc"
}

export interface PaginatedUsersResponse {
  message: string
  data: {
    users: BackendUser[]
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface SingleUserResponse {
  message: string
  data: {
    user: BackendUser
  }
}
