export type UserRole = "STUDENT" | "TEACHER" | "ADMIN"
export type AuthProvider = "LOCAL" | "GOOGLE"

export interface BackendUser {
  id: string
  name: string
  email: string
  role: UserRole
  authProvider: AuthProvider
  isBlocked: boolean
  createdAt: string
  updatedAt: string
}

export interface GetUsersParams {
  page?: number
  limit?: number
  search?: string
  role?: UserRole
  authProvider?: AuthProvider
  isBlocked?: boolean
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
