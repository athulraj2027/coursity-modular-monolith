import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { authApi } from "../api/auth.api"
import { verifyOtpSchema } from "../schemas/auth.schema"
import type { AuthResponse, ResendOtpDTO, VerifyOtpDTO } from "../types"
import { showToast } from "@/lib/toast"

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

  const { mutate: verifyOtp, isPending: isVerifyMutationPending } = useVerifyOtp()
  const { mutate: resendOtp, isPending: isResending } = useResendOtp()
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      const msg = "Email is missing. Please sign up again."
      setServerError(msg)
      showToast.error(msg)
      return
    }

    const result = verifyOtpSchema.safeParse({ email, otp: otp.trim() })
    if (!result.success) {
      const otpIssue = result.error.issues.find((issue) => issue.path[0] === "otp")
      const issueMsg =
        otpIssue?.message || result.error.issues[0]?.message || "Invalid 6-digit OTP code"
      setError(issueMsg)
      return
    }

    setError(null)
    setIsSubmitting(true)

    verifyOtp(
      {
        email,
        otp: otp.trim(),
        role,
      },
      {
        onSuccess: (response: any) => {
          const successMsg =
            response?.message || "Account verified successfully! Welcome to Coursity."
          showToast.success(successMsg)

          const user = response?.data?.user
          const userRole = (user?.role?.toLowerCase() || role) as
            | "student"
            | "teacher"
            | "admin"

          setTimeout(() => {
            setIsSubmitting(false)
            if (userRole === "teacher") {
              navigate("/teachers/dashboard")
            } else {
              navigate("/")
            }
          }, 1200)
        },
        onError: (err: any) => {
          setIsSubmitting(false)
          const errorMsg =
            err?.message || "Invalid or expired OTP. Please try again."
          setServerError(errorMsg)
          showToast.error(errorMsg)
        },
      }
    )
  }

  const handleResend = () => {
    if (countdown > 0 || isResending || isVerifyMutationPending || isSubmitting) return
    if (!email) {
      const msg = "Email is missing. Please return to sign up."
      setServerError(msg)
      showToast.error(msg)
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
        onSuccess: (response: any) => {
          const msg =
            response?.message || "A new verification code has been sent to your email."
          setResendMessage(msg)
          showToast.info(msg)
          setCountdown(60)
        },
        onError: (err: any) => {
          const errorMsg =
            err?.message || "Failed to resend OTP. Please wait before trying again."
          setServerError(errorMsg)
          showToast.error(errorMsg)
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
    isVerifying: isVerifyMutationPending || isSubmitting,
    isResending,
    handleOtpChange,
    handleSubmit,
    handleResend,
  }
}

export default useVerifyOtp
