import { useQuery } from "@tanstack/react-query"
import { authApi } from "../api/auth.api"
import { useIsRefreshingToken } from "./useIsRefreshingToken"
import type { User } from "../types"

export function useCurrentUser() {
  const isRefreshing = useIsRefreshingToken()

  const query = useQuery<User | null>({
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

  return {
    ...query,
    isRefreshing,
    isLoading: query.isLoading || isRefreshing,
  }
}

export default useCurrentUser

