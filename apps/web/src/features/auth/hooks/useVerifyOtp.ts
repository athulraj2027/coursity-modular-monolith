import { useMutation, useQueryClient } from "@tanstack/react-query"
import { authApi } from "../api/auth.api"
import type { AuthResponse, ResendOtpDTO, VerifyOtpDTO } from "../types"

export function useVerifyOtp() {
  const queryClient = useQueryClient()

  return useMutation<AuthResponse, Error, VerifyOtpDTO>({
    mutationFn: (data: VerifyOtpDTO) => authApi.verifyOtp(data),
    onSuccess: () => {
      // Refresh authenticated current user cache
      queryClient.invalidateQueries({ queryKey: ["currentUser"] })
    },
  })
}

export function useResendOtp() {
  return useMutation<AuthResponse, Error, ResendOtpDTO>({
    mutationFn: (data: ResendOtpDTO) => authApi.resendOtp(data),
  })
}

export default useVerifyOtp
