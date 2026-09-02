import { useMutation, useQueryClient } from "@tanstack/react-query"
import { authApi } from "../api/auth.api"
import type { AuthResponse } from "../types"

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation<AuthResponse, Error, void>({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      // Clear user queries from cache on logout
      queryClient.setQueryData(["currentUser"], null)
      queryClient.removeQueries({ queryKey: ["currentUser"] })
    },
  })
}

export default useLogout
