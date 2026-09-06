import { useMutation, useQueryClient } from "@tanstack/react-query"
import { authApi } from "../api/auth.api"
import type { AuthResponse } from "../types"
import { showToast } from "@/lib/toast"

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation<AuthResponse, Error, void>({
    mutationFn: () => authApi.logout(),
    onSuccess: (response: any) => {
      // Clear all cached queries across the entire app on logout
      queryClient.clear()
      showToast.success(response?.message || "Signed out successfully.")
    },
    onError: (err: any) => {
      showToast.error(err?.message || "Failed to sign out.")
    },
  })
}

export default useLogout
