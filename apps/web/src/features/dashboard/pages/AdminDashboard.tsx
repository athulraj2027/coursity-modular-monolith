import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import {
  Activity,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  IndianRupee,
  Layers,
  RefreshCw,
  Server,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  VerifyTeacherModal,
  UserDetailsDrawer,
  BlockUserModal,
} from "@/components/common"
import {
  AdminRevenueChart,
  AdminUserGrowthChart,
  AdminCategoryDistributionChart,
  AdminVerificationFunnelChart,
} from "../components"
import { useUsers, useApproveTeacher, useBlockUser, useAdminAnalytics } from "../hooks/useUsers"
import { useAdminCourseMetrics, useAdminCourses } from "@/features/course/hooks/useCourses"
import { useAdminWallets, useAdminPayouts } from "@/features/wallet/hooks/useWallet"
import { useAdminSubscriptions } from "@/features/plans/hooks/useAdminSubscriptions"
import { usePublicCategoryTree } from "@/features/categories/hooks/useCategories"
import type { BackendUser, ApprovalStatus } from "../types/user-management.types"
import type { Course } from "@/features/course/types/course.types"
import { toast } from "@/lib/toast"

const formatCurrency = (amount: number | string | undefined | null) => {
  const num = typeof amount === "string" ? parseFloat(amount) : amount || 0
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num)
}

const formatRelativeTime = (dateStr?: string | null) => {
  if (!dateStr) return "Recently"
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return "Recently"
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "Just now"
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) return `${diffInDays}d ago`
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Drawer and Modal States
  const [selectedUser, setSelectedUser] = useState<BackendUser | null>(null)
  const [teacherToApprove, setTeacherToApprove] = useState<{
    user: BackendUser
    targetStatus?: ApprovalStatus | boolean
  } | null>(null)
  const [userToBlock, setUserToBlock] = useState<BackendUser | null>(null)

  // 1. Pending & In-Progress Teacher Applications
  const {
    data: pendingTeachersResponse,
    isLoading: isPendingTeachersLoading,
  } = useUsers({
    role: "TEACHER",
    approvalStatus: "PENDING",
    limit: 6,
    sortBy: "createdAt",
    sortOrder: "desc",
  })

  // 2. All Learners & Teachers Counts
  const { data: studentsResponse, isLoading: isStudentsLoading } = useUsers({
    role: "STUDENT",
    limit: 1,
  })

  const { data: teachersResponse, isLoading: isTeachersLoading } = useUsers({
    role: "TEACHER",
    limit: 1,
  })

  const { data: verifiedTeachersResponse } = useUsers({
    role: "TEACHER",
    approvalStatus: "VERIFIED",
    limit: 1,
  })

  // 3. Course Metrics & Recent Courses & Categories
  const { data: courseMetrics, isLoading: isCourseMetricsLoading } = useAdminCourseMetrics()
  const { data: recentCoursesResponse, isLoading: isRecentCoursesLoading } = useAdminCourses({
    limit: 4,
    sortBy: "createdAt",
    sortOrder: "desc",
  })
  const { data: categoryTreeResponse } = usePublicCategoryTree()

  // 4. Financial & Payout Metrics
  const { data: walletsResponse, isLoading: isWalletsLoading } = useAdminWallets({ limit: 1 })
  const { data: pendingPayoutsResponse, isLoading: isPayoutsLoading } = useAdminPayouts({
    status: "PENDING",
    limit: 4,
  })
  const { data: subscriptionsResponse } = useAdminSubscriptions({ limit: 1 })

  // 5. Real Admin Database Analytics (Revenue, User Growth, Category Share, Verification Funnel)
  const { data: analyticsResponse, isLoading: isAnalyticsLoading } = useAdminAnalytics()
  const analyticsData = analyticsResponse?.data

  // Mutations
  const approveTeacherMutation = useApproveTeacher()
  const blockUserMutation = useBlockUser()

  // Calculated Stats
  const totalStudents = studentsResponse?.data?.total ?? analyticsData?.userGrowth?.summary?.totalStudents ?? 0
  const totalTeachers = teachersResponse?.data?.total ?? analyticsData?.userGrowth?.summary?.totalTeachers ?? 0
  const totalUsers = totalStudents + totalTeachers
  const verifiedTeachersCount = verifiedTeachersResponse?.data?.total ?? analyticsData?.userGrowth?.summary?.verifiedTeachers ?? 0
  const pendingApplicants = pendingTeachersResponse?.data?.users ?? []
  const totalPendingApplicantsCount = pendingTeachersResponse?.data?.total ?? 0

  const totalPlatformBalance =
    walletsResponse?.stats?.totalPlatformBalance ??
    subscriptionsResponse?.metrics?.totalRevenue ??
    analyticsData?.revenue?.summary?.totalGmv ??
    0
  const totalLifetimeEarned = walletsResponse?.stats?.totalLifetimeEarned ?? 0
  const pendingPayoutCount = pendingPayoutsResponse?.stats?.pendingCount ?? pendingPayoutsResponse?.total ?? 0
  const pendingPayoutAmount = pendingPayoutsResponse?.stats?.pendingAmount ?? 0

  const recentCourses: Course[] = recentCoursesResponse?.items ?? []
  const recentPayouts = pendingPayoutsResponse?.items ?? []
  const rawCategories = Array.isArray(categoryTreeResponse) ? categoryTreeResponse : []

  // Refresh all dashboard queries
  const handleRefreshAll = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-analytics"] }),
        queryClient.invalidateQueries({ queryKey: ["courses"] }),
        queryClient.invalidateQueries({ queryKey: ["categories"] }),
        queryClient.invalidateQueries({ queryKey: ["wallets"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] }),
      ])
      toast.success("Dashboard metrics synchronized")
    } catch {
      toast.error("Failed to refresh telemetry")
    } finally {
      setIsRefreshing(false)
    }
  }

  // Handle Teacher Approval Confirm
  const handleConfirmApproval = async (data: {
    approvalStatus: ApprovalStatus
    isApproved: boolean
    rejectionReason?: string | null
  }) => {
    if (!teacherToApprove) return
    const { user } = teacherToApprove
    await approveTeacherMutation.mutateAsync({
      id: user.id,
      approvalStatus: data.approvalStatus,
      isApproved: data.isApproved,
      rejectionReason: data.rejectionReason,
    })
    setTeacherToApprove(null)
    if (selectedUser?.id === user.id) {
      setSelectedUser(null)
    }
  }

  // Handle Block Confirm
  const handleConfirmBlock = async () => {
    if (!userToBlock) return
    await blockUserMutation.mutateAsync(userToBlock.id)
    setUserToBlock(null)
    if (selectedUser?.id === userToBlock.id) {
      setSelectedUser(null)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 w-full text-left">
      {/* 1. Welcome Banner & System Status */}
      <div className="relative overflow-hidden rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/60 p-6 sm:p-8 text-left shadow-xs">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#F42A18]/10 blur-3xl"
        />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider bg-[#F42A18]/10 text-[#F42A18] border border-[#F42A18]/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                Root Administrative Access
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Cluster Operational
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Platform Control Center
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Real-time platform analytics: monitor financial growth curves, audit instructor verifications, track user signups, and evaluate domain catalog distributions.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshAll}
              disabled={isRefreshing}
              className="text-xs font-semibold rounded-xl cursor-pointer flex items-center gap-2 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#F42A18]" : ""}`} />
              <span>{isRefreshing ? "Syncing..." : "Sync Telemetry"}</span>
            </Button>
            <Button
              size="sm"
              onClick={() => navigate("/admin/teachers")}
              className="text-xs font-semibold rounded-xl bg-[#F42A18] hover:bg-[#d92211] text-white cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Review Applicants</span>
            </Button>
          </div>
        </div>

        {/* Quick Action Pills */}
        <div className="relative z-10 pt-6 mt-6 border-t border-neutral-100 dark:border-neutral-800/80 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-neutral-400 dark:text-neutral-500 font-medium mr-1">Quick Shortcuts:</span>
          {[
            { label: "Instructor Roster", href: "/admin/teachers", icon: UserCheck },
            { label: "Learner Directory", href: "/admin/users", icon: Users },
            { label: "Course Moderation", href: "/admin/courses", icon: BookOpen },
            { label: "Payout Withdrawals", href: "/admin/payouts", icon: CreditCard },
            { label: "AI Interview Logs", href: "/admin/interviews", icon: Sparkles },
            { label: "AI Gateway Engine", href: "/admin/ai-config", icon: Zap },
          ].map((item, idx) => {
            const Icon = item.icon
            return (
              <Link
                key={idx}
                to={item.href}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/80 dark:border-neutral-800 hover:border-[#F42A18]/40 hover:text-[#F42A18] text-neutral-700 dark:text-neutral-300 font-medium transition-colors"
              >
                <Icon className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#F42A18]" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* 2. Platform Core Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Platform Gross Volume */}
        <div
          onClick={() => navigate("/admin/wallets")}
          className="rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/60 p-5 flex flex-col justify-between space-y-3 shadow-xs hover:border-[#F42A18]/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              Platform Gross Balance
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F42A18]/10 text-[#F42A18] group-hover:scale-110 transition-transform">
              <IndianRupee className="h-3.5 w-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-1">
              {isWalletsLoading ? (
                <div className="h-7 w-24 bg-neutral-200 dark:bg-neutral-800 rounded-md animate-pulse" />
              ) : (
                formatCurrency(totalPlatformBalance)
              )}
            </div>
            <div className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 mt-0.5 flex items-center justify-between">
              <span>Lifetime Earned: {formatCurrency(totalLifetimeEarned)}</span>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>

        {/* Metric 2: Total Active Users */}
        <div
          onClick={() => navigate("/admin/users")}
          className="rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/60 p-5 flex flex-col justify-between space-y-3 shadow-xs hover:border-[#F42A18]/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              Active Platform Accounts
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F42A18]/10 text-[#F42A18] group-hover:scale-110 transition-transform">
              <Users className="h-3.5 w-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {isStudentsLoading || isTeachersLoading ? (
                <div className="h-7 w-20 bg-neutral-200 dark:bg-neutral-800 rounded-md animate-pulse" />
              ) : (
                totalUsers.toLocaleString()
              )}
            </div>
            <div className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 mt-0.5 flex items-center justify-between">
              <span>
                {totalStudents.toLocaleString()} Learners • {totalTeachers.toLocaleString()} Instructors
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>

        {/* Metric 3: Published Courses */}
        <div
          onClick={() => navigate("/admin/courses")}
          className="rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/60 p-5 flex flex-col justify-between space-y-3 shadow-xs hover:border-[#F42A18]/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              Course Catalog Health
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F42A18]/10 text-[#F42A18] group-hover:scale-110 transition-transform">
              <BookOpen className="h-3.5 w-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {isCourseMetricsLoading ? (
                <div className="h-7 w-16 bg-neutral-200 dark:bg-neutral-800 rounded-md animate-pulse" />
              ) : (
                `${courseMetrics?.total ?? 0} Courses`
              )}
            </div>
            <div className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 mt-0.5 flex items-center justify-between">
              <span>
                {courseMetrics?.published ?? 0} Published • {courseMetrics?.frozen ?? 0} Flagged
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>

        {/* Metric 4: Pending Teacher Applicants */}
        <div
          onClick={() => navigate("/admin/teachers")}
          className="rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/60 p-5 flex flex-col justify-between space-y-3 shadow-xs hover:border-[#F42A18]/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              Instructor Verification Queue
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F42A18]/10 text-[#F42A18] group-hover:scale-110 transition-transform">
              <UserCheck className="h-3.5 w-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
              {isPendingTeachersLoading ? (
                <div className="h-7 w-20 bg-neutral-200 dark:bg-neutral-800 rounded-md animate-pulse" />
              ) : (
                <span>{totalPendingApplicantsCount} Pending</span>
              )}
              {totalPendingApplicantsCount > 0 && (
                <span className="h-2 w-2 rounded-full bg-[#F42A18] animate-ping" />
              )}
            </div>
            <div className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 mt-0.5 flex items-center justify-between">
              <span>{verifiedTeachersCount} Verified Instructors Live</span>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. MULTIPLE DYNAMIC ANALYTICS GRAPHS (With interactive filters & Real Telemetry) */}
      <div className="space-y-6">
        {/* Row A: Financial Revenue Growth Area Chart */}
        <AdminRevenueChart
          totalPlatformBalance={totalPlatformBalance}
          timeframeData={analyticsData?.revenue?.timeframes}
          summary={analyticsData?.revenue?.summary}
          isLoading={isAnalyticsLoading}
        />

        {/* Row B: User Acquisition Bar Chart & Category Donut Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AdminUserGrowthChart
            totalStudents={totalStudents}
            totalTeachers={totalTeachers}
            verifiedTeachers={verifiedTeachersCount}
            timeframeData={analyticsData?.userGrowth?.timeframes}
            isLoading={isAnalyticsLoading}
          />
          <AdminCategoryDistributionChart
            totalCourses={courseMetrics?.total ?? 36}
            items={analyticsData?.categoryDistribution}
            isLoading={isAnalyticsLoading}
          />
        </div>

        {/* Row C: Instructor Verification & Vetting Pipeline Funnel */}
        <AdminVerificationFunnelChart
          funnelStats={analyticsData?.verificationFunnel}
          isLoading={isAnalyticsLoading}
        />
      </div>

      {/* 4. Primary Operational Workspace (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Teacher Verification Queue & Recent Course Moderation */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section A: Pending Instructor Applications */}
          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/60 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-[#F42A18]/10 text-[#F42A18]">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    Pending Instructor Verification Queue
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Review incoming instructor credential submissions and vet pedagogical background.
                  </p>
                </div>
              </div>
              <Link
                to="/admin/teachers"
                className="text-xs font-semibold text-[#F42A18] hover:underline flex items-center gap-1 shrink-0"
              >
                <span>View All ({totalPendingApplicantsCount})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Applications List */}
            {isPendingTeachersLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="p-4 rounded-xl border border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-950/60 h-24 animate-pulse"
                  />
                ))}
              </div>
            ) : pendingApplicants.length === 0 ? (
              <div className="p-8 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 text-center space-y-2 bg-neutral-50/50 dark:bg-neutral-950/40">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Instructor Queue Clean & Clear
                </h4>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  All instructor vetting submissions have been reviewed and processed. New applicant submissions will appear here in real-time.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingApplicants.map((applicant) => {
                  const teacherProfile = applicant.profile?.teacherProfile
                  const expertiseList = teacherProfile?.expertise ?? []
                  const expYears = teacherProfile?.experienceYears
                  const status = teacherProfile?.approvalStatus || "PENDING"

                  const initials = applicant.name
                    ? applicant.name
                        .trim()
                        .split(/\s+/)
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()
                    : "TC"

                  return (
                    <div
                      key={applicant.id}
                      className="p-4 rounded-xl border border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-950/60 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        {applicant.profile?.avatar ? (
                          <img
                            src={applicant.profile.avatar}
                            alt={applicant.name}
                            className="w-10 h-10 rounded-xl object-cover border border-neutral-200 dark:border-neutral-800 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-[#F42A18]/10 text-[#F42A18] font-bold text-xs flex items-center justify-center shrink-0 border border-[#F42A18]/20">
                            {initials}
                          </div>
                        )}

                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                              {applicant.name}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-mono">
                              {applicant.email}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-semibold">
                              {status}
                            </span>
                          </div>

                          {expertiseList.length > 0 && (
                            <div className="text-xs text-neutral-600 dark:text-neutral-400 flex flex-wrap items-center gap-1.5">
                              <span className="font-semibold text-[#F42A18]">Domains:</span>
                              {expertiseList.slice(0, 3).map((exp, idx) => (
                                <span
                                  key={idx}
                                  className="px-1.5 py-0.5 rounded bg-neutral-200/60 dark:bg-neutral-800 text-[10px]"
                                >
                                  {exp}
                                </span>
                              ))}
                              {expertiseList.length > 3 && (
                                <span className="text-[10px] text-neutral-400">
                                  +{expertiseList.length - 3} more
                                </span>
                              )}
                            </div>
                          )}

                          <div className="text-[11px] text-neutral-500 flex items-center gap-2">
                            <span>{expYears ? `${expYears} yrs exp` : "Experience unlisted"}</span>
                            <span>•</span>
                            <span>Applied {formatRelativeTime(applicant.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedUser(applicant)}
                          className="text-xs rounded-xl cursor-pointer"
                        >
                          Inspect
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            setTeacherToApprove({ user: applicant, targetStatus: "VERIFIED" })
                          }
                          className="text-xs font-semibold rounded-xl bg-[#F42A18] hover:bg-[#d92211] text-white cursor-pointer shadow-xs flex items-center gap-1"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Review & Verify</span>
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Section B: Recent Course Moderation Stream */}
          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/60 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-[#F42A18]/10 text-[#F42A18]">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    Catalog Stream & Course Moderation
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Recently authored courses across tech domains pending catalog review or updates.
                  </p>
                </div>
              </div>
              <Link
                to="/admin/courses"
                className="text-xs font-semibold text-[#F42A18] hover:underline flex items-center gap-1 shrink-0"
              >
                <span>All Courses ({courseMetrics?.total ?? 0})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {isRecentCoursesLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="p-4 rounded-xl border border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-950/60 h-28 animate-pulse"
                  />
                ))}
              </div>
            ) : recentCourses.length === 0 ? (
              <div className="p-8 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 text-center space-y-2 bg-neutral-50/50 dark:bg-neutral-950/40">
                <BookOpen className="w-6 h-6 text-neutral-400 mx-auto" />
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                  No Courses Published Yet
                </h4>
                <p className="text-xs text-neutral-500">
                  Instructors haven't created any course drafts or published curriculum.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recentCourses.map((course) => {
                  const instructor = course.teacherProfile?.profile?.user?.name || "Unknown Teacher"
                  const isFree = course.pricingType === "FREE"
                  const priceStr = isFree ? "Free" : formatCurrency(course.price)

                  return (
                    <div
                      key={course.id}
                      onClick={() => navigate(`/admin/courses/${course.id}`)}
                      className="p-4 rounded-xl border border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-950/60 hover:border-[#F42A18]/30 transition-all cursor-pointer flex flex-col justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-3">
                        {course.thumbnail ? (
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-14 h-14 rounded-lg object-cover border border-neutral-200 dark:border-neutral-800 shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center shrink-0 text-neutral-400">
                            <BookOpen className="w-6 h-6" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                course.status === "PUBLISHED"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                  : course.status === "DRAFT"
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                              }`}
                            >
                              {course.status}
                            </span>
                            <span className="text-xs font-bold text-neutral-900 dark:text-white">
                              {priceStr}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-neutral-900 dark:text-white line-clamp-1 group-hover:text-[#F42A18] transition-colors">
                            {course.title}
                          </h4>
                          <p className="text-[11px] text-neutral-500 truncate">
                            By {instructor}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
                        <span>{course.totalLessons || 0} Lessons • {course.totalModules || 0} Modules</span>
                        <span className="text-neutral-500">{formatRelativeTime(course.createdAt)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Telemetry, Pending Payouts & System Security */}
        <div className="space-y-6 flex flex-col">
          {/* Section A: Pending Instructor Payouts */}
          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/60 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#F42A18]" />
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  Payout Pipeline
                </h3>
              </div>
              <Link
                to="/admin/payouts"
                className="text-xs font-semibold text-[#F42A18] hover:underline"
              >
                Manage
              </Link>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 block">
                  Pending Withdrawal Sum
                </span>
                <span className="text-lg font-bold text-neutral-900 dark:text-white font-mono">
                  {formatCurrency(pendingPayoutAmount)}
                </span>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                {pendingPayoutCount} Pending
              </span>
            </div>

            {isPayoutsLoading ? (
              <div className="space-y-2">
                {[1, 2].map((n) => (
                  <div
                    key={n}
                    className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800 h-14 animate-pulse"
                  />
                ))}
              </div>
            ) : recentPayouts.length === 0 ? (
              <p className="text-xs text-neutral-500 text-center py-2">
                No withdrawal requests awaiting disbursement.
              </p>
            ) : (
              <div className="space-y-2 text-xs">
                {recentPayouts.slice(0, 3).map((payout) => (
                  <div
                    key={payout.id}
                    className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-semibold text-neutral-900 dark:text-white truncate">
                        {payout.user?.name || "Instructor"}
                      </p>
                      <p className="text-[10px] text-neutral-500 truncate">
                        {payout.payoutMethod} • {payout.accountSummary}
                      </p>
                    </div>
                    <span className="font-bold text-[#F42A18] shrink-0 font-mono">
                      {formatCurrency(payout.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section B: Microservices Cluster Telemetry */}
          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/60 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#F42A18]" />
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  Cluster Health & Nodes
                </h3>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                All Systems Normal
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <Server className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="text-neutral-600 dark:text-neutral-400">Core REST API (Clean Arch)</span>
                </div>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">HTTP/2 200 OK</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="text-neutral-600 dark:text-neutral-400">AI Voice Evaluator Engine</span>
                </div>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">WebSocket Active</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="text-neutral-600 dark:text-neutral-400">Redis Cache & Queues</span>
                </div>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">Cluster Active</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="text-neutral-600 dark:text-neutral-400">Postgres 16 & Prisma 6</span>
                </div>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">Pool Active</span>
              </div>
            </div>
          </div>

          {/* Section C: Security & Access Guard */}
          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/60 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-[#F42A18]" />
                Security & Audit Ledger
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Encrypted TLS 1.3
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Role-Based Access Control (RBAC) enforced on all administrative endpoints. JWT token rotation active with Redis-backed session revocation.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Verification Modal */}
      {teacherToApprove && (
        <VerifyTeacherModal
          user={teacherToApprove.user}
          targetStatus={teacherToApprove.targetStatus}
          isOpen={!!teacherToApprove}
          onClose={() => setTeacherToApprove(null)}
          onConfirm={handleConfirmApproval}
          isLoading={approveTeacherMutation.isPending}
        />
      )}

      {/* User Details Drawer for Applicant Inspection */}
      {selectedUser && (
        <UserDetailsDrawer
          user={selectedUser}
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          titleFallback="Applicant Dossier"
          onApprove={(_userId, status) => {
            setTeacherToApprove({ user: selectedUser, targetStatus: status })
          }}
          onBlock={() => setUserToBlock(selectedUser)}
        />
      )}

      {/* Block User Confirmation Modal */}
      {userToBlock && (
        <BlockUserModal
          user={userToBlock}
          isOpen={!!userToBlock}
          onClose={() => setUserToBlock(null)}
          onConfirm={handleConfirmBlock}
          isLoading={blockUserMutation.isPending}
        />
      )}
    </div>
  )
}

export default AdminDashboardPage
