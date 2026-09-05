import { apiClient } from "@/lib/api-client"
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
    if (params.sortBy) searchParams.append("sortBy", params.sortBy)
    if (params.sortOrder) searchParams.append("sortOrder", params.sortOrder)

    const queryStr = searchParams.toString()
    const endpoint = queryStr ? `/users?${queryStr}` : "/users"

    return apiClient<PaginatedUsersResponse>(endpoint, {
      method: "GET",
    })
  },

  getUserById: async (id: string): Promise<BackendUser> => {
    const response = await apiClient<SingleUserResponse>(`/users/${id}`, {
      method: "GET",
    })
    return response.data.user
  },


  blockUser: async (id: string, isBlocked?: boolean): Promise<{ message: string; data?: { user: BackendUser } }> => {
    return apiClient<{ message: string; data?: { user: BackendUser } }>(`/users/${id}/block`, {
      method: "PATCH",
      ...(isBlocked !== undefined ? { body: JSON.stringify({ isBlocked }) } : {}),
    })
  },
}

export default userApi
