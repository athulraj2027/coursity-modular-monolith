import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { authApi } from "../api/auth.api"
import { signupSchema, type SignupFormData } from "../schemas/auth.schema"
import type { AuthFormErrors, AuthResponse, SignupDTO } from "../types"

export function useRegister() {
  return useMutation<AuthResponse, Error, SignupDTO>({
    mutationFn: (data: SignupDTO) => authApi.register(data),
  })
}

export function useSignupForm(role: "student" | "teacher" = "student") {
  const navigate = useNavigate()
  const { mutate: register, isPending } = useRegister()

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

    register(
      {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role,
      },
      {
        onSuccess: () => {
          const verifyRoute =
            role === "teacher"
              ? `/teachers/verify-otp`
              : `/verify-otp`
          navigate(verifyRoute, { state: { email: encodeURIComponent(formData.email) } })
        },
        onError: (err: any) => {
          setServerError(err?.message || "Failed to create account. Please try again.")
        },
      }
    )
  }

  return {
    formData,
    errors,
    serverError,
    isPending,
    handleChange,
    handleSubmit,
  }
}

export default useRegister
