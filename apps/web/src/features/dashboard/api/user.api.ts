import { apiClient } from "@/lib/api-client"
import { USER_API_ROUTES } from "../constants/routes.constants"
import type {
  BackendUser,
  GetUsersParams,
  PaginatedUsersResponse,
  SingleUserResponse,
} from "../types/user-management.types"

export const userApi = {
  getUsers: async (params: GetUsersParams = {}): Promise<PaginatedUsersResponse> => {
    const searchParams = new URLSearchParams()

    if (params.page !== undefined) searchParams.append("page", String(params.page))
    if (params.limit !== undefined) searchParams.append("limit", String(params.limit))
    if (params.search && params.search.trim()) searchParams.append("search", params.search.trim())
    if (params.role) searchParams.append("role", params.role)
    if (params.authProvider) searchParams.append("authProvider", params.authProvider)
    if (params.isBlocked !== undefined) searchParams.append("isBlocked", String(params.isBlocked))
    if (params.isApproved !== undefined) searchParams.append("isApproved", String(params.isApproved))
    if (params.approvalStatus) searchParams.append("approvalStatus", params.approvalStatus)
    if (params.sortBy) searchParams.append("sortBy", params.sortBy)
    if (params.sortOrder) searchParams.append("sortOrder", params.sortOrder)

    const queryStr = searchParams.toString()
    const endpoint = USER_API_ROUTES.LIST(queryStr)

    return apiClient<PaginatedUsersResponse>(endpoint, {
      method: "GET",
    })
  },

  getUserById: async (id: string): Promise<BackendUser> => {
    const response = await apiClient<SingleUserResponse>(USER_API_ROUTES.BY_ID(id), {
      method: "GET",
    })
    return response.data.user
  },

  blockUser: async (id: string, isBlocked?: boolean): Promise<{ message: string; data?: { user: BackendUser } }> => {
    return apiClient<{ message: string; data?: { user: BackendUser } }>(USER_API_ROUTES.BLOCK(id), {
      method: "PATCH",
      ...(isBlocked !== undefined ? { body: JSON.stringify({ isBlocked }) } : {}),
    })
  },

  approveTeacher: async (
    id: string,
    payload:
      | {
          approvalStatus?: import("../types/user-management.types").ApprovalStatus
          isApproved?: boolean
          rejectionReason?: string | null
        }
      | boolean = true
  ): Promise<{ message: string; data?: { user: BackendUser } }> => {
    const body = typeof payload === "boolean" ? { isApproved: payload } : payload
    return apiClient<{ message: string; data?: { user: BackendUser } }>(USER_API_ROUTES.APPROVE(id), {
      method: "PATCH",
      body: JSON.stringify(body),
    })
  },
}

export default userApi
