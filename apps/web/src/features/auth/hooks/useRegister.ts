import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { authApi } from "../api/auth.api"
import { signupSchema, type SignupFormData } from "../schemas/auth.schema"
import type { AuthFormErrors, AuthResponse, SignupDTO } from "../types"
import { showToast } from "@/lib/toast"

export function useRegister() {
  return useMutation<AuthResponse, Error, SignupDTO>({
    mutationFn: (data: SignupDTO) => authApi.register(data),
  })
}

export function useSignupForm(role: "student" | "teacher" = "student") {
  const navigate = useNavigate()
  const { mutate: register, isPending: isMutationPending } = useRegister()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState<SignupFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<AuthFormErrors<SignupFormData>>({})
  const [serverError, setServerError] = useState<string | null>(null)

  const handleChange = (field: keyof SignupFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
    if (serverError) setServerError(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setServerError(null)

    const result = signupSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors: AuthFormErrors<SignupFormData> = {}
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as keyof SignupFormData
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message
        }
      })
      setErrors(fieldErrors)
      return
    }

    setErrors({})
    setIsSubmitting(true)

    register(
      {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role,
      },
      {
        onSuccess: (response: any) => {
          const successMsg =
            response?.message + "Verification code sent to your email!"
          showToast.success(successMsg)

          const verifyRoute =
            role === "teacher" ? `/teachers/verify-otp` : `/verify-otp`

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
            err?.message || "Failed to create account. Please try again."
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

export default useRegister
