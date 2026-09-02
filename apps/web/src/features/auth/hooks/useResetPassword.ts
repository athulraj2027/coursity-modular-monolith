import { useMutation } from "@tanstack/react-query"
import { authApi } from "../api/auth.api"
import type { AuthResponse, ResetPasswordDTO } from "../types"

export function useResetPassword() {
  return useMutation<AuthResponse, Error, ResetPasswordDTO>({
    mutationFn: (data: ResetPasswordDTO) => authApi.resetPassword(data),
  })
}

export default useResetPassword
