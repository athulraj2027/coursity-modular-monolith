import React, { useState } from "react"
import { Link } from "react-router-dom"
import {
  STUDENT_SIGNUP_CONFIG,
  TEACHER_SIGNUP_CONFIG,
  type AuthFormConfig,
} from "@/constants/auth"
import {
  signupSchema,
  type AuthFormErrors,
  type SignupFormData,
} from "@/validations/auth"
import { CheckCircle2, Send } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GoogleButton } from "./GoogleButton"
import { cn } from "@/lib/utils"

export interface SignupProps {
  role?: "student" | "teacher"
  config?: AuthFormConfig
}

export const Signup: React.FC<SignupProps> = ({ role = "student", config }) => {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState<SignupFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<AuthFormErrors<SignupFormData>>({})

  const formConfig =
    config || (role === "teacher" ? TEACHER_SIGNUP_CONFIG : STUDENT_SIGNUP_CONFIG)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

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
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="text-center py-8 space-y-3.5 w-full max-w-sm mx-auto">
        <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-[#F42A18]/10 text-[#F42A18]">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
          {formConfig.successTitle}
        </h3>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto">
          {formConfig.successSubtitle}
        </p>
        <Link
          to={role === "teacher" ? "/teachers/dashboard" : "/students/dashboard"}
          className="inline-block px-6 py-2.5 rounded-xl bg-[#F42A18] text-white text-xs sm:text-sm font-semibold hover:bg-[#d92211] transition-colors shadow-lg shadow-[#F42A18]/25"
        >
          {formConfig.successButtonText}
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3.5 sm:space-y-4 w-full max-w-sm mx-auto">
      <div className="text-left space-y-1">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-[#F42A18]">
          {formConfig.tagline}
        </span>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {formConfig.title}
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-normal">
          {formConfig.subtitle}
        </p>
      </div>

      {/* Seamless form directly on page without background box */}
      <form onSubmit={handleSubmit} noValidate className="space-y-2.5 sm:space-y-3">
        {/* Full Name */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="signup-name"
              className="text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200"
            >
              {formConfig.nameLabel || "Full Name"}
            </Label>
            {errors.name && (
              <span className="text-[11px] font-medium text-[#F42A18] animate-in fade-in slide-in-from-right-1 duration-150">
                {errors.name}
              </span>
            )}
          </div>
          <Input
            id="signup-name"
            className={cn(
              "h-9 text-xs sm:text-sm px-3 py-1.5 rounded-xl transition-colors",
              errors.name && "border-[#F42A18] focus-visible:ring-[#F42A18]/25"
            )}
            placeholder={formConfig.namePlaceholder || "Alex Turing"}
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value })
              if (errors.name) {
                setErrors((prev) => ({ ...prev, name: undefined }))
              }
            }}
          />
        </div>

        {/* Email */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="signup-email"
              className="text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200"
            >
              {formConfig.emailLabel}
            </Label>
            {errors.email && (
              <span className="text-[11px] font-medium text-[#F42A18] animate-in fade-in slide-in-from-right-1 duration-150">
                {errors.email}
              </span>
            )}
          </div>
          <Input
            id="signup-email"
            type="email"
            className={cn(
              "h-9 text-xs sm:text-sm px-3 py-1.5 rounded-xl transition-colors",
              errors.email && "border-[#F42A18] focus-visible:ring-[#F42A18]/25"
            )}
            placeholder={formConfig.emailPlaceholder}
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value })
              if (errors.email) {
                setErrors((prev) => ({ ...prev, email: undefined }))
              }
            }}
          />
        </div>

        {/* Password */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="signup-password"
              className="text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200"
            >
              {formConfig.passwordLabel}
            </Label>
            {errors.password && (
              <span className="text-[11px] font-medium text-[#F42A18] animate-in fade-in slide-in-from-right-1 duration-150">
                {errors.password}
              </span>
            )}
          </div>
          <Input
            id="signup-password"
            type="password"
            className={cn(
              "h-9 text-xs sm:text-sm px-3 py-1.5 rounded-xl transition-colors",
              errors.password && "border-[#F42A18] focus-visible:ring-[#F42A18]/25"
            )}
            placeholder={formConfig.passwordPlaceholder}
            value={formData.password}
            onChange={(e) => {
              setFormData({ ...formData, password: e.target.value })
              if (errors.password) {
                setErrors((prev) => ({ ...prev, password: undefined }))
              }
            }}
          />
        </div>

        {/* Confirm Password */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="signup-confirm-password"
              className="text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200"
            >
              {formConfig.confirmPasswordLabel || "Confirm Password"}
            </Label>
            {errors.confirmPassword && (
              <span className="text-[11px] font-medium text-[#F42A18] animate-in fade-in slide-in-from-right-1 duration-150">
                {errors.confirmPassword}
              </span>
            )}
          </div>
          <Input
            id="signup-confirm-password"
            type="password"
            className={cn(
              "h-9 text-xs sm:text-sm px-3 py-1.5 rounded-xl transition-colors",
              errors.confirmPassword && "border-[#F42A18] focus-visible:ring-[#F42A18]/25"
            )}
            placeholder={formConfig.confirmPasswordPlaceholder || "••••••••"}
            value={formData.confirmPassword}
            onChange={(e) => {
              setFormData({ ...formData, confirmPassword: e.target.value })
              if (errors.confirmPassword) {
                setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
              }
            }}
          />
        </div>

        {/* Primary Submit Button */}
        <button
          type="submit"
          className="w-full h-10 py-2 rounded-xl bg-[#F42A18] text-white text-xs sm:text-sm font-semibold hover:bg-[#d92211] transition-all shadow-md shadow-[#F42A18]/20 cursor-pointer flex items-center justify-center gap-2 mt-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          {formConfig.buttonText}
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center py-0.5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
          </div>
          <span className="relative px-2.5 bg-white dark:bg-black text-[11px] font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            or
          </span>
        </div>

        {/* Continue with Google at bottom */}
        <GoogleButton role={role} />

        {formConfig.signinPrompt && formConfig.signinHref && (
          <p className="text-center text-xs text-neutral-600 dark:text-neutral-400 pt-0.5">
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

export default Signup