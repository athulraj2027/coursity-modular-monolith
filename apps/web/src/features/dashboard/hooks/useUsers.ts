import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { userApi } from "../api/user.api"
import type { GetUsersParams } from "../types/user-management.types"
import { toast } from "@/lib/toast"

export const USER_QUERY_KEY = ["admin-users"] as const

export function useUsers(params: GetUsersParams = {}) {
  return useQuery({
    queryKey: [...USER_QUERY_KEY, params],
    queryFn: () => userApi.getUsers(params),
    placeholderData: (previousData) => previousData,
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

