import { useQuery } from "@tanstack/react-query"
import { authApi } from "../api/auth.api"
import type { User } from "../types"

export function useCurrentUser() {
  return useQuery<User | null>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      try {
        return await authApi.getCurrentUser()
      } catch {
        // Any auth error (401 unauthenticated, 403 blocked, or missing session) returns null for guest
        return null
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export default useCurrentUser

