import { useMutation, useQueryClient } from "@tanstack/react-query"
import { authApi } from "../api/auth.api"
import type { AuthResponse, SigninDTO } from "../types"

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation<AuthResponse, Error, SigninDTO>({
    mutationFn: (data: SigninDTO) => authApi.login(data),
    onSuccess: () => {
      // Invalidate user queries to refresh authentication state
      queryClient.invalidateQueries({ queryKey: ["currentUser"] })
    },
  })
}

export default useLogin
