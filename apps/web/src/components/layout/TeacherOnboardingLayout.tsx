import React from "react"
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom"
import {
  FileText,
  Clock,
  Bot,
  GraduationCap,
  LogOut,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Building2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/common/ThemeToggle"
import { useConfirmDialog } from "@/hooks/useConfirmDialog"
import { useLogout, useCurrentUser } from "@/features/auth"
import { useProfile } from "@/features/profile"

export const TeacherOnboardingLayout: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const logout = useLogout()
  const { data: user } = useCurrentUser()
  const { data: profileData } = useProfile()
  const { confirm, ConfirmDialog } = useConfirmDialog()

  const teacherProfile = profileData?.teacherProfile
  const approvalStatus = teacherProfile?.approvalStatus || (teacherProfile?.isApproved ? "VERIFIED" : "PENDING")
  const isInterviewPassed = Boolean(teacherProfile?.isInterviewPassed)

  // Determine current active step index (0-based)
  // 0: Profile & Credentials (PENDING / REDO)
  // 1: Under Review (IN_PROGRESS)
  // 2: AI Vetting Assessment (VERIFIED & !isInterviewPassed)
  // 3: Bank & Payout Setup (VERIFIED & isInterviewPassed & on /bank-details)
  // 4: Creator Hub Unlocked (VERIFIED & isInterviewPassed)
  let currentStepIndex = 0
  if (approvalStatus === "IN_PROGRESS") {
    currentStepIndex = 1
  } else if (approvalStatus === "VERIFIED" && !isInterviewPassed) {
    currentStepIndex = 2
  } else if (approvalStatus === "VERIFIED" && isInterviewPassed) {
    if (location.pathname.includes("/bank-details") || location.pathname.includes("/payout")) {
      currentStepIndex = 3
    } else {
      currentStepIndex = 4
    }
  }

  const steps = [
    {
      id: "profile",
      title: "Profile & Credentials",
      shortTitle: "Profile",
      icon: FileText,
      path: "/teachers/onboarding/profile",
    },
    {
      id: "review",
      title: "Admissions Review",
      shortTitle: "Review",
      icon: Clock,
      path: "/teachers/onboarding/review",
    },
    {
      id: "interview",
      title: "AI Vetting Assessment",
      shortTitle: "AI Interview",
      icon: Bot,
      path: "/teachers/onboarding/interview",
    },
    {
      id: "bank-details",
      title: "Bank & Payout Setup",
      shortTitle: "Payout Setup",
      icon: Building2,
      path: "/teachers/onboarding/bank-details",
    },
    {
      id: "dashboard",
      title: "Creator Studio Hub",
      shortTitle: "Creator Hub",
      icon: GraduationCap,
      path: "/teachers/dashboard",
    },
  ]

  const handleSignOut = async () => {
    const confirmed = await confirm({
      actionType: "logout",
      title: "Sign Out of Coursity",
      description: "Are you sure you want to sign out? Your onboarding progress will remain saved.",
    })

    if (!confirmed) return

    try {
      await logout.mutateAsync()
    } catch {
      // ignore
    } finally {
      navigate("/teachers/signin", { replace: true })
    }
  }

  const avatarUrl =
    profileData?.profile?.avatar ||
    user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "Instructor")}&background=F42A18&color=fff`

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50/70 dark:bg-neutral-950 text-neutral-900 dark:text-white transition-colors duration-200">
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-neutral-200/80 dark:border-neutral-900 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md px-4 sm:px-8">
        {/* Brand & Badge */}
        <div className="flex items-center gap-3">
          <Link
            to="/teachers/onboarding/profile"
            className="flex items-center gap-2.5 group transition-transform active:scale-95"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#F42A18] to-rose-600 text-white shadow-md shadow-[#F42A18]/20 font-black text-base">
              C
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-sm font-bold tracking-tight text-neutral-900 dark:text-white leading-none">
                Coursity
              </span>
              <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mt-0.5">
                Instructor Portal
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1.5 ml-2 pl-3 border-l border-neutral-200 dark:border-neutral-800">
            <Badge
              variant="outline"
              className="text-[11px] font-semibold bg-[#F42A18]/10 text-[#F42A18] border-[#F42A18]/25 gap-1 py-0.5 px-2.5"
            >
              <Sparkles className="w-3 h-3 text-[#F42A18]" />
              Onboarding Setup
            </Badge>
          </div>
        </div>

        {/* Stepper Progress Indicator (Desktop & Tablet) */}
        <div className="hidden lg:flex items-center gap-2">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex
            const isCurrent = idx === currentStepIndex

            return (
              <React.Fragment key={step.id}>
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isCurrent
                      ? "bg-[#F42A18]/10 text-[#F42A18] border border-[#F42A18]/30 shadow-xs"
                      : isCompleted
                      ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                      : "text-neutral-400 dark:text-neutral-600 bg-neutral-100/60 dark:bg-neutral-900/60 border border-transparent"
                  }`}
                >
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                      isCurrent
                        ? "bg-[#F42A18] text-white"
                        : isCompleted
                        ? "bg-emerald-500 text-white"
                        : "bg-neutral-200 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>
                  <span>{step.title}</span>
                </div>
                {idx < steps.length - 1 && (
                  <ChevronRight
                    className={`w-3.5 h-3.5 ${
                      idx < currentStepIndex
                        ? "text-emerald-500"
                        : "text-neutral-300 dark:text-neutral-700"
                    }`}
                  />
                )}
              </React.Fragment>
            )
          })}
        </div>

        {/* Right Section: User details & Sign out */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2.5 pl-2">
            <img
              src={avatarUrl}
              alt={user?.name || "Instructor Avatar"}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-neutral-200 dark:ring-neutral-800 bg-neutral-100 dark:bg-neutral-800"
            />
            <div className="flex flex-col text-left max-w-[140px]">
              <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                {user?.name || "Instructor"}
              </span>
              <span className="text-[10px] text-neutral-400 truncate">
                {user?.email || "Account"}
              </span>
            </div>
          </div>

          <ThemeToggle />

          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="gap-1.5 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-[#F42A18] hover:border-[#F42A18]/40 dark:hover:border-[#F42A18]/40 cursor-pointer h-9 px-3"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </header>

      {/* Mobile Stepper Banner */}
      <div className="lg:hidden flex items-center justify-between border-b border-neutral-200/60 dark:border-neutral-900 bg-white/60 dark:bg-neutral-950/60 px-4 py-2.5 text-xs">
        <div className="flex items-center gap-2 font-semibold text-[#F42A18]">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F42A18] text-white text-[11px] font-bold">
            {currentStepIndex + 1}
          </div>
          <span>Step {currentStepIndex + 1} of {steps.length}: {steps[currentStepIndex]?.title}</span>
        </div>
        <span className="text-[11px] font-medium text-neutral-400">
          {Math.round(((currentStepIndex + 1) / steps.length) * 100)}% Complete
        </span>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col w-full max-w-6xl mx-auto p-4 sm:p-8">
        <Outlet />
      </main>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog />
    </div>
  )
}

export default TeacherOnboardingLayout
