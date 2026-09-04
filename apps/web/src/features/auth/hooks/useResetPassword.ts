import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { authApi } from "../api/auth.api"
import { useForgotPassword } from "./useForgotPassword"
import { resetPasswordSchema, type ResetPasswordFormData } from "../schemas/auth.schema"
import type { AuthFormErrors, AuthResponse, ResetPasswordDTO } from "../types"
import { showToast } from "@/lib/toast"

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

  const { mutate: resetPassword, isPending: isResetMutationPending } = useResetPassword()
  const { mutate: resendOtp, isPending: isResending } = useForgotPassword()
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      const msg = "Email is missing. Please request password reset again."
      setServerError(msg)
      showToast.error(msg)
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
    setIsSubmitting(true)

    resetPassword(
      {
        email,
        otp: formData.otp,
        newPassword: formData.newPassword,
        role,
      },
      {
        onSuccess: (response: any) => {
          const successMsg =
            response?.message ||
            "Password reset successfully! Please sign in with your new password."
          showToast.success(successMsg)

          const signinRoute =
            role === "teacher" ? "/teachers/signin" : "/signin"

          setTimeout(() => {
            setIsSubmitting(false)
            navigate(signinRoute)
          }, 1200)
        },
        onError: (err: any) => {
          setIsSubmitting(false)
          const errorMsg =
            err?.message ||
            "Failed to reset password. Please verify the OTP code."
          setServerError(errorMsg)
          showToast.error(errorMsg)
        },
      }
    )
  }

  const handleResend = () => {
    if (countdown > 0 || isResending || isResetMutationPending || isSubmitting) return
    if (!email) {
      const msg = "Email is missing. Please request password reset again."
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
            response?.message || "A new recovery code has been sent to your email."
          setResendMessage(msg)
          showToast.info(msg)
          setCountdown(60)
        },
        onError: (err: any) => {
          const errorMsg =
            err?.message ||
            "Failed to resend recovery code. Please wait before trying again."
          setServerError(errorMsg)
          showToast.error(errorMsg)
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
    isPending: isResetMutationPending || isSubmitting,
    isResending,
    handleChange,
    handleSubmit,
    handleResend,
  }
}

export default useResetPassword
