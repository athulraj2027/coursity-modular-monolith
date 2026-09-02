import React, { useState } from "react"
import { Link } from "react-router-dom"
import {
  STUDENT_FORGOT_PASSWORD_CONFIG,
  TEACHER_FORGOT_PASSWORD_CONFIG,
  type AuthFormConfig,
} from "@/constants/auth"
import {
  forgotPasswordSchema,
  type AuthFormErrors,
  type ForgotPasswordFormData,
} from "@/validations/auth"
import { CheckCircle2, Mail, Send } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export interface ForgotPasswordProps {
  role?: "student" | "teacher"
  config?: AuthFormConfig
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({
  role = "student",
  config,
}) => {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: "",
  })
  const [errors, setErrors] = useState<AuthFormErrors<ForgotPasswordFormData>>({})

  const formConfig =
    config ||
    (role === "teacher"
      ? TEACHER_FORGOT_PASSWORD_CONFIG
      : STUDENT_FORGOT_PASSWORD_CONFIG)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

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
    setSubmitted(true)
  }

  if (submitted) {
    const resetLink =
      role === "teacher"
        ? `/teachers/reset-password?email=${encodeURIComponent(formData.email)}`
        : `/reset-password?email=${encodeURIComponent(formData.email)}`

    return (
      <div className="text-center py-12 space-y-4 w-full max-w-sm mx-auto">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-[#F42A18]/10 text-[#F42A18]">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
          {formConfig.successTitle}
        </h3>
        <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto">
          {formConfig.successSubtitle}
        </p>
        <Link
          to={resetLink}
          className="inline-block px-7 py-3 rounded-xl bg-[#F42A18] text-white text-sm font-semibold hover:bg-[#d92211] transition-colors shadow-lg shadow-[#F42A18]/25"
        >
          {formConfig.successButtonText}
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full max-w-sm mx-auto">
      <div className="text-left space-y-1.5">
        <div className="flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5 text-[#F42A18]" />
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

      {/* Seamless form directly on page without background box */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="forgot-email"
              className="text-sm font-semibold text-neutral-800 dark:text-neutral-200"
            >
              {formConfig.emailLabel || "Email Address"}
            </Label>
            {errors.email && (
              <span className="text-xs font-medium text-[#F42A18] animate-in fade-in slide-in-from-right-1 duration-150">
                {errors.email}
              </span>
            )}
          </div>
          <Input
            id="forgot-email"
            type="email"
            className={cn(
              "h-10 text-sm px-3.5 py-2 rounded-xl transition-colors",
              errors.email && "border-[#F42A18] focus-visible:ring-[#F42A18]/25"
            )}
            placeholder={formConfig.emailPlaceholder || "alex@example.com"}
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value })
              if (errors.email) {
                setErrors((prev) => ({ ...prev, email: undefined }))
              }
            }}
          />
        </div>

        <button
          type="submit"
          className="w-full h-11 py-2.5 rounded-xl bg-[#F42A18] text-white text-sm font-semibold hover:bg-[#d92211] transition-all shadow-lg shadow-[#F42A18]/25 cursor-pointer flex items-center justify-center gap-2 mt-2"
        >
          <Send className="w-4 h-4" />
          {formConfig.buttonText}
        </button>

        {formConfig.signinPrompt && formConfig.signinHref && (
          <p className="text-center text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 pt-1">
            {formConfig.signinPrompt}{" "}
            <Link
              to={formConfig.signinHref}
              className="text-[#F42A18] font-semibold hover:underline"
            >
              {formConfig.signinLinkText}
            </Link>
          </p>
        )}
      </form>
    </div>
  )
}

export default ForgotPassword
