import React from "react"
import { useSearchParams } from "react-router-dom"
import { VerifyOtp } from "@/components/auth/VerifyOtp"

export interface VerifyOtpPageProps {
  role?: "student" | "teacher"
}

export const VerifyOtpPage: React.FC<VerifyOtpPageProps> = ({
  role: initialRole,
}) => {
  const [searchParams] = useSearchParams()
  const roleParam = searchParams.get("role")
  const role =
    initialRole || (roleParam === "teacher" ? "teacher" : "student")

  return (
    <div className="w-full min-h-[calc(100vh-3.75rem)] flex items-center justify-center py-16 px-4 sm:px-6 relative overflow-hidden">
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center opacity-40"
      >
        <div className="h-[400px] w-[60vw] max-w-[700px] rounded-full bg-gradient-to-tr from-[#F42A18]/15 to-transparent blur-3xl" />
      </div>

      <div className="w-full max-w-sm">
        <VerifyOtp role={role} />
      </div>
    </div>
  )
}

export default VerifyOtpPage
