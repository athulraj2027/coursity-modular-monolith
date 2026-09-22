import React from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { useProfile } from "@/features/profile"
import { useCurrentUser } from "../hooks"

export interface TeacherOnboardingGuardProps {
  children?: React.ReactNode
}

/**
 * Route guard that enforces the AWS-style progressive onboarding funnel for teachers:
 * - Stage 1 (PENDING/REDO): Restricts to /teachers/onboarding/profile
 * - Stage 2 (IN_PROGRESS): Restricts to /teachers/onboarding/review
 * - Stage 3 (VERIFIED, !isInterviewPassed): Restricts to /teachers/onboarding/interview, /teachers/interviews, and /teachers/profile
 * - Stage 4 (VERIFIED, isInterviewPassed): Full access to /teachers/dashboard and creator tools
 */
export const TeacherOnboardingGuard: React.FC<TeacherOnboardingGuardProps> = ({ children }) => {
  const { data: user, isLoading: isUserLoading } = useCurrentUser()
  const { data: profileData, isLoading: isProfileLoading } = useProfile()
  const location = useLocation()

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white transition-colors duration-200">
        <div className="flex flex-col items-center gap-3">
          <div className="relative flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-2 border-neutral-200 dark:border-neutral-800 animate-pulse" />
            <Loader2 className="w-6 h-6 text-[#F42A18] animate-spin absolute" />
          </div>
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 tracking-wide animate-pulse">
            Checking instructor onboarding status...
          </p>
        </div>
      </div>
    )
  }

  // If not teacher, allow parent RoleGuard to handle
  const role = user?.role?.toUpperCase()
  if (role !== "TEACHER") {
    return children ? <>{children}</> : <Outlet />
  }

  const teacherProfile = profileData?.teacherProfile
  const approvalStatus =
    teacherProfile?.approvalStatus || (teacherProfile?.isApproved ? "VERIFIED" : "PENDING")
  const isInterviewPassed = Boolean(teacherProfile?.isInterviewPassed)
  const pathname = location.pathname

  // Allow plans and billing routes regardless of onboarding status
  if (
    pathname.startsWith("/teachers/plans") ||
    pathname.startsWith("/teachers/billing") ||
    pathname.startsWith("/teacher/plans") ||
    pathname.startsWith("/teacher/billing")
  ) {
    return children ? <>{children}</> : <Outlet />
  }

  // Stage 4: Completed Onboarding (VERIFIED & Interview Passed)
  if (approvalStatus === "VERIFIED" && isInterviewPassed) {
    // If completed teacher lands on an onboarding path, redirect to full dashboard
    if (pathname.startsWith("/teachers/onboarding")) {
      return <Navigate to="/teachers/dashboard" replace />
    }
    return children ? <>{children}</> : <Outlet />
  }

  // Stage 1: Profile Completion & Verification Submission (PENDING or REDO)
  if (approvalStatus === "PENDING" || approvalStatus === "REDO") {
    if (pathname !== "/teachers/onboarding/profile" && !pathname.includes("/password")) {
      return <Navigate to="/teachers/onboarding/profile" replace />
    }
    return children ? <>{children}</> : <Outlet />
  }

  // Stage 2: Application In Progress / Under Review
  if (approvalStatus === "IN_PROGRESS") {
    if (pathname !== "/teachers/onboarding/review" && !pathname.includes("/password")) {
      return <Navigate to="/teachers/onboarding/review" replace />
    }
    return children ? <>{children}</> : <Outlet />
  }

  // Stage 3: Credentials Verified, Awaiting AI Interview Pass
  if (approvalStatus === "VERIFIED" && !isInterviewPassed) {
    // Only allow the onboarding interview assessment page and active interview studio session
    const isAllowed =
      pathname === "/teachers/onboarding/interview" ||
      pathname.startsWith("/interview/")

    if (!isAllowed) {
      return <Navigate to="/teachers/onboarding/interview" replace />
    }
    return children ? <>{children}</> : <Outlet />
  }

  // Fallback
  return children ? <>{children}</> : <Outlet />
}


export default TeacherOnboardingGuard
