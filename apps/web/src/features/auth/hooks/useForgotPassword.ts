import { useMutation } from "@tanstack/react-query"
import { authApi } from "../api/auth.api"
import type { AuthResponse, ForgotPasswordDTO } from "../types"

export function useForgotPassword() {
  return useMutation<AuthResponse, Error, ForgotPasswordDTO>({
    mutationFn: (data: ForgotPasswordDTO) => authApi.forgotPassword(data),
  })
}

export default useForgotPassword
