import { useMutation } from "@tanstack/react-query"
import { authApi } from "../api/auth.api"
import type { AuthResponse, ResendOtpDTO, VerifyOtpDTO } from "../types"

export function useVerifyOtp() {
  return useMutation<AuthResponse, Error, VerifyOtpDTO>({
    mutationFn: (data: VerifyOtpDTO) => authApi.verifyOtp(data),
  })
}

export function useResendOtp() {
  return useMutation<AuthResponse, Error, ResendOtpDTO>({
    mutationFn: (data: ResendOtpDTO) => authApi.resendOtp(data),
  })
}

export default useVerifyOtp
