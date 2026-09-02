import React, { useState } from "react"
import { Link } from "react-router-dom"
import { TEACHER_SIGNUP_CONFIG } from "@/constants/teachers"
import { CheckCircle2, Send } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const TeacherSignupForm: React.FC = () => {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.password) return
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-[#F42A18]/10 text-[#F42A18]">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
          {TEACHER_SIGNUP_CONFIG.successTitle}
        </h3>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto">
          {TEACHER_SIGNUP_CONFIG.successSubtitle}
        </p>
        <Link
          to="/dashboard"
          className="inline-block px-6 py-2.5 rounded-xl bg-[#F42A18] text-white text-xs font-semibold hover:bg-[#d92211] transition-colors shadow-lg shadow-[#F42A18]/25"
        >
          {TEACHER_SIGNUP_CONFIG.successButtonText}
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="text-left space-y-1">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-[#F42A18]">
          {TEACHER_SIGNUP_CONFIG.tagline}
        </span>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {TEACHER_SIGNUP_CONFIG.title}
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {TEACHER_SIGNUP_CONFIG.subtitle}
        </p>
      </div>

      {/* Seamless form directly on page without background box */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="space-y-1.5">
          <Label htmlFor="hero-signup-name" className="text-xs font-semibold">
            {TEACHER_SIGNUP_CONFIG.nameLabel}
          </Label>
          <Input
            id="hero-signup-name"
            placeholder={TEACHER_SIGNUP_CONFIG.namePlaceholder}
            required
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="hero-signup-email" className="text-xs font-semibold">
            {TEACHER_SIGNUP_CONFIG.emailLabel}
          </Label>
          <Input
            id="hero-signup-email"
            type="email"
            placeholder={TEACHER_SIGNUP_CONFIG.emailPlaceholder}
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="hero-signup-password" className="text-xs font-semibold">
            {TEACHER_SIGNUP_CONFIG.passwordLabel}
          </Label>
          <Input
            id="hero-signup-password"
            type="password"
            placeholder={TEACHER_SIGNUP_CONFIG.passwordPlaceholder}
            required
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-[#F42A18] text-white text-sm font-semibold hover:bg-[#d92211] transition-all shadow-lg shadow-[#F42A18]/25 cursor-pointer flex items-center justify-center gap-2 mt-2"
        >
          <Send className="w-4 h-4" />
          {TEACHER_SIGNUP_CONFIG.buttonText}
        </button>

        <p className="text-center text-xs text-neutral-500 dark:text-neutral-400 pt-1">
          {TEACHER_SIGNUP_CONFIG.signinPrompt}{" "}
          <Link
            to={TEACHER_SIGNUP_CONFIG.signinHref}
            className="text-[#F42A18] font-semibold hover:underline"
          >
            {TEACHER_SIGNUP_CONFIG.signinLinkText}
          </Link>
        </p>
      </form>
    </div>
  )
}
