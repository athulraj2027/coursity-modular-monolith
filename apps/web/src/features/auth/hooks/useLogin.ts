import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { authApi } from "../api/auth.api"
import { signinSchema, type SigninFormData } from "../schemas/auth.schema"
import type { AuthFormErrors, AuthResponse, SigninDTO } from "../types"
import { showToast } from "@/lib/toast"

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation<AuthResponse, Error, SigninDTO>({
    mutationFn: (data: SigninDTO) => authApi.login(data),
    onSuccess: () => {
      // Clear previous user session cache completely and refresh currentUser
      queryClient.clear()
      queryClient.invalidateQueries({ queryKey: ["currentUser"] })
    },
  })
}

export function useSigninForm(role: "student" | "teacher" | "admin" = "student") {
  const navigate = useNavigate()
  const { mutate: login, isPending: isMutationPending } = useLogin()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState<SigninFormData>({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState<AuthFormErrors<SigninFormData>>({})
  const [serverError, setServerError] = useState<string | null>(null)

  const handleChange = (field: keyof SigninFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
    if (serverError) setServerError(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setServerError(null)

    const result = signinSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors: AuthFormErrors<SigninFormData> = {}
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as keyof SigninFormData
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message
        }
      })
      setErrors(fieldErrors)
      return
    }

    setErrors({})
    setIsSubmitting(true)

    login(
      {
        email: formData.email,
        password: formData.password,
        role,
      },
      {
        onSuccess: (response: any) => {
          const successMessage =
            response?.message || "Signed in successfully! Welcome back."
          showToast.success(successMessage)

          const user = response?.data?.user || response?.user
          const userRole = (user?.role?.toLowerCase() || role) as
            | "student"
            | "teacher"
            | "admin"

          // Give user time to read the toast with active loading spinner before redirecting
          setTimeout(() => {
            setIsSubmitting(false)
            if (userRole === "admin") {
              navigate("/admin/dashboard")
            } else if (userRole === "teacher") {
              navigate("/teachers/dashboard")
            } else {
              navigate("/")
            }
          }, 1200)
        },
        onError: (err: any) => {
          setIsSubmitting(false)
          const errorMsg =
            err?.message || "Failed to sign in. Please check your credentials."
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

export default useLogin
