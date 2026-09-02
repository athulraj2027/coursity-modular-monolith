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
          to={role === "teacher" ? "/dashboard" : "/courses"}
          className="inline-block px-7 py-3 rounded-xl bg-[#F42A18] text-white text-sm font-semibold hover:bg-[#d92211] transition-colors shadow-lg shadow-[#F42A18]/25"
        >
          {formConfig.successButtonText}
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-5 w-full max-w-sm mx-auto">
      <div className="text-left space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#F42A18]">
          {formConfig.tagline}
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {formConfig.title}
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {formConfig.subtitle}
        </p>
      </div>

      {/* Seamless form directly on page without background box */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="signup-name"
              className="text-sm font-semibold text-neutral-800 dark:text-neutral-200"
            >
              {formConfig.nameLabel || "Full Name"}
            </Label>
            {errors.name && (
              <span className="text-xs font-medium text-[#F42A18] animate-in fade-in slide-in-from-right-1 duration-150">
                {errors.name}
              </span>
            )}
          </div>
          <Input
            id="signup-name"
            className={cn(
              "h-10 text-sm px-3.5 py-2 rounded-xl transition-colors",
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
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="signup-email"
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
            id="signup-email"
            type="email"
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
            }}
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="signup-password"
              className="text-sm font-semibold text-neutral-800 dark:text-neutral-200"
            >
              {formConfig.passwordLabel}
            </Label>
            {errors.password && (
              <span className="text-xs font-medium text-[#F42A18] animate-in fade-in slide-in-from-right-1 duration-150">
                {errors.password}
              </span>
            )}
          </div>
          <Input
            id="signup-password"
            type="password"
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
            }}
          />
        </div>

        {/* Primary Submit Button */}
        <button
          type="submit"
          className="w-full h-11 py-2.5 rounded-xl bg-[#F42A18] text-white text-sm font-semibold hover:bg-[#d92211] transition-all shadow-lg shadow-[#F42A18]/25 cursor-pointer flex items-center justify-center gap-2 mt-2"
        >
          <Send className="w-4 h-4" />
          {formConfig.buttonText}
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center pt-1 pb-0.5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
          </div>
          <span className="relative px-3 bg-white dark:bg-neutral-950 text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            or
          </span>
        </div>

        {/* Continue with Google at bottom */}
        <GoogleButton role={role} />

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

export default Signup