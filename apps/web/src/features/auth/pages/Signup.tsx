import React from "react"
import { useLocation, useSearchParams } from "react-router-dom"
import { Signup } from "../components/Signup"
import type { UserRole } from "../types"

export interface SignupPageProps {
  role?: UserRole
}

export const SignupPage: React.FC<SignupPageProps> = ({ role }) => {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const activeRole: "student" | "teacher" =
    (role === "teacher" || role === "student" ? role : undefined) ||
    (location.pathname.startsWith("/teachers") ||
    searchParams.get("role") === "teacher"
      ? "teacher"
      : "student")

  return (
    <div className="w-full min-h-[calc(100vh-3.75rem)] flex items-center justify-center py-4 sm:py-6 px-4 sm:px-6 relative overflow-hidden">
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center opacity-40"
      >
        <div className="h-[350px] w-[50vw] max-w-[600px] rounded-full bg-gradient-to-tr from-[#F42A18]/15 to-transparent blur-3xl" />
      </div>

      <div className="w-full max-w-sm my-auto">
        <Signup role={activeRole} />
      </div>
    </div>
  )
}

export default SignupPage
