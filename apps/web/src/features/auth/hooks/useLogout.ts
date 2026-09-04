import { useMutation, useQueryClient } from "@tanstack/react-query"
import { authApi } from "../api/auth.api"
import type { AuthResponse } from "../types"
import { showToast } from "@/lib/toast"

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation<AuthResponse, Error, void>({
    mutationFn: () => authApi.logout(),
    onSuccess: (response: any) => {
      // Clear user queries from cache on logout
      queryClient.setQueryData(["currentUser"], null)
      queryClient.removeQueries({ queryKey: ["currentUser"] })
      showToast.success(response?.message || "Signed out successfully.")
    },
    onError: (err: any) => {
      showToast.error(err?.message || "Failed to sign out.")
    },
  })
}

export default useLogout
