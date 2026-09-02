import { useQuery } from "@tanstack/react-query"
import { authApi } from "../api/auth.api"
import type { User } from "../types"

export function useCurrentUser() {
  return useQuery<User | null>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      try {
        return await authApi.getCurrentUser()
      } catch (err: any) {
        // If 401 Unauthorized, return null (guest) without throwing unhandled rejection
        if (err?.status === 401) {
          return null
        }
        throw err
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

export default useCurrentUser
