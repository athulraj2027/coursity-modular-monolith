import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { userApi } from "../api/user.api"
import type { GetUsersParams } from "../types/user-management.types"
import { toast } from "@/lib/toast"

export const USER_QUERY_KEY = ["admin-users"] as const

export function useUsers(params: GetUsersParams = {}) {
  return useQuery({
    queryKey: [
      ...USER_QUERY_KEY,
      {
        role: params.role,
        page: params.page,
        limit: params.limit,
        search: params.search || "",
        authProvider: params.authProvider || "all",
        isApproved: params.isApproved === undefined ? "all" : params.isApproved,
        isBlocked: params.isBlocked === undefined ? "all" : params.isBlocked,
        sortBy: params.sortBy || "createdAt",
        sortOrder: params.sortOrder || "desc",
      },
    ],
    queryFn: () => userApi.getUsers(params),
  })
}

export function useBlockUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: { id: string; isBlocked?: boolean } | string) => {
      const userId = typeof payload === "string" ? payload : payload.id
      const blockedStatus = typeof payload === "object" ? payload.isBlocked : undefined
      return userApi.blockUser(userId, blockedStatus)
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY })
      toast.success(res?.message || "User status updated successfully")
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update user block status")
    },
  })
}

export function useApproveTeacher() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: { id: string; isApproved?: boolean } | string) => {
      const teacherId = typeof payload === "string" ? payload : payload.id
      const isApproved = typeof payload === "object" && payload.isApproved !== undefined ? payload.isApproved : true
      return userApi.approveTeacher(teacherId, isApproved)
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY })
      toast.success(res?.message || "Teacher verification status updated successfully")
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update teacher verification status")
    },
  })
}
