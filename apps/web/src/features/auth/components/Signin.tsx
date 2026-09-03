import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  STUDENT_SIGNIN_CONFIG,
  TEACHER_SIGNIN_CONFIG,
  ADMIN_SIGNIN_CONFIG,
  type AuthFormConfig,
} from "../constants"
import {
  signinSchema,
  type SigninFormData,
} from "../schemas/auth.schema"
import type { AuthFormErrors } from "../types"
import { LogIn, Shield, AlertCircle, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GoogleButton } from "./GoogleButton"
import { useLogin } from "../hooks/useLogin"
import { cn } from "@/lib/utils"

export interface SigninProps {
  role?: "student" | "teacher" | "admin"
  config?: AuthFormConfig
}

export const Signin: React.FC<SigninProps> = ({ role = "student", config }) => {
  const navigate = useNavigate()
  const { mutate: login, isPending } = useLogin()

  const [formData, setFormData] = useState<SigninFormData>({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState<AuthFormErrors<SigninFormData>>({})
  const [serverError, setServerError] = useState<string | null>(null)

  const formConfig =
    config ||
    (role === "admin"
      ? ADMIN_SIGNIN_CONFIG
      : role === "teacher"
        ? TEACHER_SIGNIN_CONFIG
        : STUDENT_SIGNIN_CONFIG)

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
          const token = response?.data?.accessToken || response?.data?.token
          const refreshToken = response?.data?.refreshToken
          const user = response?.data?.user

          if (token) localStorage.setItem("accessToken", token)
          if (refreshToken) localStorage.setItem("refreshToken", refreshToken)
          if (user) localStorage.setItem("user", JSON.stringify(user))

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

  return (
    <div className="space-y-5 w-full max-w-sm mx-auto">
      <div className="text-left space-y-1.5">
        <div className="flex items-center gap-1.5">
          {role === "admin" && (
            <Shield className="w-3.5 h-3.5 text-[#F42A18]" />
          )}
          <span className="text-xs font-semibold uppercase tracking-widest text-[#F42A18]">
            {formConfig.tagline}
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {formConfig.title}
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {formConfig.subtitle}
        </p>
      </div>

      {serverError && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Seamless form directly on page without background box */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="signin-email"
              className="text-sm font-semibold text-neutral-800 dark:text-neutral-200"
            >
              {formConfig.emailLabel}
            </Label>
            {errors.email && (
              <span className="text-xs font-medium text-[#F42A18] animate-in fade-in slide-in-from-right-1 duration-150">
                {errors.email}
              </span>
            )}
          </div>
          <Input
            id="signin-email"
            type="email"
            disabled={isPending}
            className={cn(
              "h-10 text-sm px-3.5 py-2 rounded-xl transition-colors",
              errors.email && "border-[#F42A18] focus-visible:ring-[#F42A18]/25"
            )}
            placeholder={formConfig.emailPlaceholder}
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value })
              if (errors.email) {
                setErrors((prev) => ({ ...prev, email: undefined }))
              }
              if (serverError) setServerError(null)
            }}
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="signin-password"
              className="text-sm font-semibold text-neutral-800 dark:text-neutral-200"
            >
              {formConfig.passwordLabel}
            </Label>
            {errors.password ? (
              <span className="text-xs font-medium text-[#F42A18] animate-in fade-in slide-in-from-right-1 duration-150">
                {errors.password}
              </span>
            ) : formConfig.forgotPasswordHref ? (
              <Link
                to={formConfig.forgotPasswordHref}
                className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-[#F42A18] transition-colors"
              >
                {formConfig.forgotPasswordLinkText || "Forgot password?"}
              </Link>
            ) : null}
          </div>
          <Input
            id="signin-password"
            type="password"
            disabled={isPending}
            className={cn(
              "h-10 text-sm px-3.5 py-2 rounded-xl transition-colors",
              errors.password && "border-[#F42A18] focus-visible:ring-[#F42A18]/25"
            )}
            placeholder={formConfig.passwordPlaceholder}
            value={formData.password}
            onChange={(e) => {
              setFormData({ ...formData, password: e.target.value })
              if (errors.password) {
                setErrors((prev) => ({ ...prev, password: undefined }))
              }
              if (serverError) setServerError(null)
            }}
          />
        </div>

        {/* Primary Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full h-11 py-2.5 rounded-xl bg-[#F42A18] text-white text-sm font-semibold hover:bg-[#d92211] transition-all shadow-lg shadow-[#F42A18]/25 cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Signing In...</span>
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>{formConfig.buttonText}</span>
            </>
          )}
        </button>

        {/* Continue with Google at bottom (shown for student and teacher) */}
        {role !== "admin" && (
          <>
            <div className="relative flex items-center justify-center pt-1 pb-0.5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
              </div>
              <span className="relative px-3 bg-white dark:bg-neutral-950 text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                or
              </span>
            </div>

            <GoogleButton role={role} />
          </>
        )}

        {formConfig.signupPrompt && formConfig.signupHref && (
          <p className="text-center text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 pt-1">
            {formConfig.signupPrompt}{" "}
            <Link
              to={formConfig.signupHref}
              className="text-[#F42A18] font-semibold hover:underline"
            >
              {formConfig.signupLinkText}
            </Link>
          </p>
        )}
      </form>
    </div>
  )
}

export default Signin
