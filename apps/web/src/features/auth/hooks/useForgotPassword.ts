import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { authApi } from "../api/auth.api"
import { forgotPasswordSchema, type ForgotPasswordFormData } from "../schemas/auth.schema"
import type { AuthFormErrors, AuthResponse, ForgotPasswordDTO } from "../types"
import { showToast } from "@/lib/toast"

export function useForgotPassword() {
  return useMutation<AuthResponse, Error, ForgotPasswordDTO>({
    mutationFn: (data: ForgotPasswordDTO) => authApi.forgotPassword(data),
  })
}

export function useForgotPasswordForm(role: "student" | "teacher" = "student") {
  const navigate = useNavigate()
  const { mutate: forgotPassword, isPending: isMutationPending } = useForgotPassword()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: "",
  })
  const [errors, setErrors] = useState<AuthFormErrors<ForgotPasswordFormData>>({})
  const [serverError, setServerError] = useState<string | null>(null)

  const handleChange = (field: keyof ForgotPasswordFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
    if (serverError) setServerError(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setServerError(null)

    const result = forgotPasswordSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors: AuthFormErrors<ForgotPasswordFormData> = {}
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as keyof ForgotPasswordFormData
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message
        }
      })
      setErrors(fieldErrors)
      return
    }

    setErrors({})
    setIsSubmitting(true)

    forgotPassword(
      {
        email: formData.email,
        role,
      },
      {
        onSuccess: (response: any) => {
          const successMsg =
            response?.message || "Password recovery instructions sent to your email!"
          showToast.success(successMsg)

          const verifyRoute =
            role === "teacher"
              ? `/teachers/reset-password`
              : `/reset-password`

          setTimeout(() => {
            setIsSubmitting(false)
            navigate(verifyRoute, {
              state: { email: encodeURIComponent(formData.email) },
            })
          }, 1000)
        },
        onError: (err: any) => {
          setIsSubmitting(false)
          const errorMsg =
            err?.message ||
            "Failed to send reset instructions. Please check the email."
          setServerError(errorMsg)
          showToast.error(errorMsg)
        },
      }
    )
  }

  return {
    formData,
    errors,
    serverError,
    isPending: isMutationPending || isSubmitting,
    handleChange,
    handleSubmit,
  }
}

export default useForgotPassword
