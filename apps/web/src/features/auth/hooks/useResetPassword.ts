import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { authApi } from "../api/auth.api"
import { useForgotPassword } from "./useForgotPassword"
import { resetPasswordSchema, type ResetPasswordFormData } from "../schemas/auth.schema"
import type { AuthFormErrors, AuthResponse, ResetPasswordDTO } from "../types"

export type ResetPasswordFormInputs = Omit<ResetPasswordFormData, "email">

export function useResetPassword() {
  return useMutation<AuthResponse, Error, ResetPasswordDTO>({
    mutationFn: (data: ResetPasswordDTO) => authApi.resetPassword(data),
  })
}

export function useResetPasswordForm(role: "student" | "teacher" = "student") {
  const navigate = useNavigate()
  const location = useLocation()

  const stateEmail = (location.state as { email?: string } | null)?.email
  const email = stateEmail ? decodeURIComponent(stateEmail) : ""

  const { mutate: resetPassword, isPending } = useResetPassword()
  const { mutate: resendOtp, isPending: isResending } = useForgotPassword()

  const [countdown, setCountdown] = useState(60)
  const [serverError, setServerError] = useState<string | null>(null)
  const [resendMessage, setResendMessage] = useState<string | null>(null)
  const [formData, setFormData] = useState<ResetPasswordFormInputs>({
    otp: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<AuthFormErrors<ResetPasswordFormInputs>>({})

  useEffect(() => {
    if (countdown <= 0) return

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown])

  const handleChange = (field: keyof ResetPasswordFormInputs, value: string) => {
    const val = field === "otp" ? value.replace(/\D/g, "") : value
    setFormData((prev) => ({ ...prev, [field]: val }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
    if (serverError) setServerError(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setServerError(null)
    setResendMessage(null)

    if (!email) {
      setServerError("Email is missing. Please request password reset again.")
      return
    }

    const result = resetPasswordSchema.safeParse({
      email,
      ...formData,
    })

    if (!result.success) {
      const fieldErrors: AuthFormErrors<ResetPasswordFormInputs> = {}
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as keyof ResetPasswordFormInputs
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message
        }
      })
      setErrors(fieldErrors)
      return
    }

    setErrors({})

    resetPassword(
      {
        email,
        otp: formData.otp,
        newPassword: formData.newPassword,
        role,
      },
      {
        onSuccess: () => {
          const signinRoute = role === "teacher" ? "/teachers/signin" : "/signin"
          navigate(signinRoute)
        },
        onError: (err: any) => {
          setServerError(err?.message || "Failed to reset password. Please verify the OTP code.")
        },
      }
    )
  }

  const handleResend = () => {
    if (countdown > 0 || isResending || isPending) return
    if (!email) {
      setServerError("Email is missing. Please request password reset again.")
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
          setResendMessage("A new recovery code has been sent to your email.")
          setCountdown(60)
        },
        onError: (err: any) => {
          setServerError(err?.message || "Failed to resend recovery code. Please wait before trying again.")
        },
      }
    )
  }

  return {
    email,
    formData,
    errors,
    countdown,
    serverError,
    resendMessage,
    isPending,
    isResending,
    handleChange,
    handleSubmit,
    handleResend,
  }
}

export default useResetPassword
