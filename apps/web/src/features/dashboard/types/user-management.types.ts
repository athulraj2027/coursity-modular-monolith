export type UserRole = "STUDENT" | "TEACHER" | "ADMIN"
export type AuthProvider = "LOCAL" | "GOOGLE"
export type ApprovalStatus = "PENDING" | "IN_PROGRESS" | "VERIFIED" | "REVOKED" | "REDO"

export interface BackendTeacherProfile {
  id: string
  expertise: string[]
  qualifications?: string | null
  experienceYears?: number | null
  resume?: string | null
  credentials?: string[]
  identityCard?: string | null
  linkedinUrl?: string | null
  twitterUrl?: string | null
  websiteUrl?: string | null
  isApproved: boolean
  approvalStatus?: ApprovalStatus
  rejectionReason?: string | null
  submissionCount?: number
  createdAt?: string
  updatedAt?: string
}

export interface BackendUserProfile {
  id: string
  avatar?: string | null
  bio?: string | null
  phone?: string | null
  country?: string | null
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
  googleId?: string | null
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
  approvalStatus?: ApprovalStatus
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

export interface RevenueTimeframePoint {
  label: string
  date: string
  gmv: number
  net: number
  payouts: number
  transactions: number
}

export interface UserGrowthTimeframePoint {
  label: string
  date: string
  students: number
  teachers: number
}

export interface CategoryDistributionItem {
  id: string
  name: string
  slug: string
  count: number
  color: string
  paidCount: number
  freeCount: number
  publishedCount: number
  draftCount: number
}

export interface VerificationFunnelStats {
  totalSubmitted: number
  interviewAttempted: number
  interviewPassed: number
  underReview: number
  redoRequested: number
  verified: number
  revoked: number
  avgTurnaroundHours: number
}

export interface AdminAnalyticsData {
  revenue: {
    timeframes: {
      "7D": RevenueTimeframePoint[]
      "30D": RevenueTimeframePoint[]
      "90D": RevenueTimeframePoint[]
      "1Y": RevenueTimeframePoint[]
    }
    summary: {
      totalGmv: number
      totalNet: number
      totalPayouts: number
      totalTransactions: number
      growthRate: number
    }
  }
  userGrowth: {
    timeframes: {
      "7D": UserGrowthTimeframePoint[]
      "30D": UserGrowthTimeframePoint[]
      "90D": UserGrowthTimeframePoint[]
      "1Y": UserGrowthTimeframePoint[]
    }
    summary: {
      totalStudents: number
      totalTeachers: number
      verifiedTeachers: number
    }
  }
  categoryDistribution: CategoryDistributionItem[]
  verificationFunnel: VerificationFunnelStats
}

export interface AdminAnalyticsResponse {
  success: boolean
  message: string
  data: AdminAnalyticsData
}
