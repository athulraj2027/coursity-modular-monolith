import React, { useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import {
  STUDENT_RESET_PASSWORD_CONFIG,
  TEACHER_RESET_PASSWORD_CONFIG,
  type AuthFormConfig,
} from "../constants"
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "../schemas/auth.schema"
import type { AuthFormErrors } from "../types"
import { CheckCircle2, Lock, ShieldCheck } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export interface ResetPasswordProps {
  role?: "student" | "teacher"
  config?: AuthFormConfig
}

export const ResetPassword: React.FC<ResetPasswordProps> = ({
  role = "student",
  config,
}) => {
  const [searchParams] = useSearchParams()
  const defaultEmail = searchParams.get("email") || ""

  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState<ResetPasswordFormData>({
    email: defaultEmail,
    otp: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<AuthFormErrors<ResetPasswordFormData>>({})

  const formConfig =
    config ||
    (role === "teacher"
      ? TEACHER_RESET_PASSWORD_CONFIG
      : STUDENT_RESET_PASSWORD_CONFIG)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const result = resetPasswordSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors: AuthFormErrors<ResetPasswordFormData> = {}
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as keyof ResetPasswordFormData
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
    const signinLink =
      role === "teacher"
        ? "/teachers/signin"
        : "/signin"

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
          to={signinLink}
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
          <ShieldCheck className="w-3.5 h-3.5 text-[#F42A18]" />
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
              htmlFor="reset-email"
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
            id="reset-email"
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

        {/* 6-Digit OTP */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="reset-otp"
              className="text-sm font-semibold text-neutral-800 dark:text-neutral-200"
            >
              {formConfig.otpLabel || "6-Digit Recovery OTP"}
            </Label>
            {errors.otp && (
              <span className="text-xs font-medium text-[#F42A18] animate-in fade-in slide-in-from-right-1 duration-150">
                {errors.otp}
              </span>
            )}
          </div>
          <Input
            id="reset-otp"
            type="text"
            maxLength={6}
            className={cn(
              "h-10 text-sm px-3.5 py-2 rounded-xl tracking-widest font-mono text-center transition-colors",
              errors.otp && "border-[#F42A18] focus-visible:ring-[#F42A18]/25"
            )}
            placeholder={formConfig.otpPlaceholder || "123456"}
            value={formData.otp}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "")
              setFormData({ ...formData, otp: val })
              if (errors.otp) {
                setErrors((prev) => ({ ...prev, otp: undefined }))
              }
            }}
          />
        </div>

        {/* New Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="reset-new-password"
              className="text-sm font-semibold text-neutral-800 dark:text-neutral-200"
            >
              {formConfig.newPasswordLabel || "New Password"}
            </Label>
            {errors.newPassword && (
              <span className="text-xs font-medium text-[#F42A18] animate-in fade-in slide-in-from-right-1 duration-150">
                {errors.newPassword}
              </span>
            )}
          </div>
          <Input
            id="reset-new-password"
            type="password"
            className={cn(
              "h-10 text-sm px-3.5 py-2 rounded-xl transition-colors",
              errors.newPassword && "border-[#F42A18] focus-visible:ring-[#F42A18]/25"
            )}
            placeholder={formConfig.newPasswordPlaceholder || "••••••••"}
            value={formData.newPassword}
            onChange={(e) => {
              setFormData({ ...formData, newPassword: e.target.value })
              if (errors.newPassword) {
                setErrors((prev) => ({ ...prev, newPassword: undefined }))
              }
            }}
          />
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="reset-confirm-password"
              className="text-sm font-semibold text-neutral-800 dark:text-neutral-200"
            >
              {formConfig.confirmPasswordLabel || "Confirm New Password"}
            </Label>
            {errors.confirmPassword && (
              <span className="text-xs font-medium text-[#F42A18] animate-in fade-in slide-in-from-right-1 duration-150">
                {errors.confirmPassword}
              </span>
            )}
          </div>
          <Input
            id="reset-confirm-password"
            type="password"
            className={cn(
              "h-10 text-sm px-3.5 py-2 rounded-xl transition-colors",
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

        <button
          type="submit"
          className="w-full h-11 py-2.5 rounded-xl bg-[#F42A18] text-white text-sm font-semibold hover:bg-[#d92211] transition-all shadow-lg shadow-[#F42A18]/25 cursor-pointer flex items-center justify-center gap-2 mt-2"
        >
          <Lock className="w-4 h-4" />
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

export default ResetPassword
