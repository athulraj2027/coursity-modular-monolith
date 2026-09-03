import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { authApi } from "../api/auth.api"
import { signinSchema, type SigninFormData } from "../schemas/auth.schema"
import type { AuthFormErrors, AuthResponse, SigninDTO } from "../types"

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation<AuthResponse, Error, SigninDTO>({
    mutationFn: (data: SigninDTO) => authApi.login(data),
    onSuccess: () => {
      // Invalidate user queries to refresh authentication state
      queryClient.invalidateQueries({ queryKey: ["currentUser"] })
    },
  })
}

export function useSigninForm(role: "student" | "teacher" | "admin" = "student") {
  const navigate = useNavigate()
  const { mutate: login, isPending } = useLogin()

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

    login(
      {
        email: formData.email,
        password: formData.password,
        role,
      },
      {
        onSuccess: (response: any) => {
          const user = response?.data?.user
          const userRole = (user?.role?.toLowerCase() || role) as "student" | "teacher" | "admin"
          if (userRole === "admin") {
            navigate("/admin/dashboard")
          } else if (userRole === "teacher") {
            navigate("/teachers/dashboard")
          } else {
            navigate("/students/dashboard")
          }
        },
        onError: (err: any) => {
          setServerError(err?.message || "Failed to sign in. Please check your credentials.")
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

export default useLogin
