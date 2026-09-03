import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { authApi } from "../api/auth.api"
import { verifyOtpSchema } from "../schemas/auth.schema"
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

export function useVerifyOtpForm(role: "student" | "teacher" = "student") {
  const navigate = useNavigate()
  const location = useLocation()

  const stateEmail = (location.state as { email?: string } | null)?.email
  const email = stateEmail ? decodeURIComponent(stateEmail) : ""

  const { mutate: verifyOtp, isPending: isVerifying } = useVerifyOtp()
  const { mutate: resendOtp, isPending: isResending } = useResendOtp()

  const [otp, setOtp] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(60)
  const [serverError, setServerError] = useState<string | null>(null)
  const [resendMessage, setResendMessage] = useState<string | null>(null)

  useEffect(() => {
    if (countdown <= 0) return

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown])

  const handleOtpChange = (value: string) => {
    const val = value.replace(/\D/g, "")
    setOtp(val)
    if (error) setError(null)
    if (serverError) setServerError(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setServerError(null)
    setResendMessage(null)

    if (!email) {
      setServerError("Email is missing. Please sign up again.")
      return
    }

    const result = verifyOtpSchema.safeParse({ email, otp: otp.trim() })
    if (!result.success) {
      const otpIssue = result.error.issues.find((issue) => issue.path[0] === "otp")
      setError(otpIssue?.message || result.error.issues[0]?.message || "Invalid 6-digit OTP code")
      return
    }

    setError(null)

    verifyOtp(
      {
        email,
        otp: otp.trim(),
        role,
      },
      {
        onSuccess: (response: any) => {
          const user = response?.data?.user
          const userRole = (user?.role?.toLowerCase() || role) as "student" | "teacher" | "admin"
          if (userRole === "teacher") {
            navigate("/teachers/dashboard")
          } else {
            navigate("/students/dashboard")
          }
        },
        onError: (err: any) => {
          setServerError(err?.message || "Invalid or expired OTP. Please try again.")
        },
      }
    )
  }

  const handleResend = () => {
    if (countdown > 0 || isResending || isVerifying) return
    if (!email) {
      setServerError("Email is missing. Please return to sign up.")
      return
    }

    setServerError(null)
    setResendMessage(null)

    resendOtp(
      {
        email,
        role,
      },
      {
        onSuccess: () => {
          setResendMessage("A new verification code has been sent to your email.")
          setCountdown(60)
        },
        onError: (err: any) => {
          setServerError(err?.message || "Failed to resend OTP. Please wait before trying again.")
        },
      }
    )
  }

  return {
    email,
    otp,
    error,
    countdown,
    serverError,
    resendMessage,
    isVerifying,
    isResending,
    handleOtpChange,
    handleSubmit,
    handleResend,
  }
}

export default useVerifyOtp
