import { useState, useMemo } from "react"
import {
  Users,
  ShieldCheck,
  Ban,
  RefreshCw,
  Calendar,
  KeyRound,
  Globe,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  UserX,
  MessageSquare,
  SlidersHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DataTableTemplate,
  UserDetailsDrawer,
  BlockUserModal,
  VerifyTeacherModal,
  type TableColumn,
  type TableMetricCard,
} from "@/components/common"
import { useUsers, useBlockUser, useApproveTeacher } from "../hooks/useUsers"
import { useDebounce } from "@/hooks/use-debounce"
import type { BackendUser, AuthProvider, ApprovalStatus } from "../types/user-management.types"

export const AdminTeachersPage = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 300)

  // Status & Provider filters
  const [approvalFilter, setApprovalFilter] = useState<string>("all")
  const [authProviderFilter, setAuthProviderFilter] = useState<string>("all")
  const [sortOption, setSortOption] = useState<string>("newest")
  const [selectedTeacher, setSelectedTeacher] = useState<BackendUser | null>(null)
  const [teacherToBlock, setTeacherToBlock] = useState<BackendUser | null>(null)
  const [teacherToApprove, setTeacherToApprove] = useState<{
    user: BackendUser
    targetStatus?: ApprovalStatus | boolean
  } | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  // Determine sort parameters for backend
  const { sortBy, sortOrder } = useMemo(() => {
    switch (sortOption) {
      case "oldest":
        return { sortBy: "createdAt" as const, sortOrder: "asc" as const }
      case "name-asc":
        return { sortBy: "name" as const, sortOrder: "asc" as const }
      case "email-asc":
        return { sortBy: "email" as const, sortOrder: "asc" as const }
      case "newest":
      default:
        return { sortBy: "createdAt" as const, sortOrder: "desc" as const }
    }
  }, [sortOption])

  // Approval status query filter
  const approvalStatusQuery = useMemo(() => {
    if (approvalFilter === "all") return undefined
    return approvalFilter as ApprovalStatus
  }, [approvalFilter])

  const {
    data: usersResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useUsers({
    role: "TEACHER",
    page: currentPage,
    limit: pageSize,
    search: debouncedSearch || undefined,
    authProvider: authProviderFilter === "all" ? undefined : (authProviderFilter as AuthProvider),
    approvalStatus: approvalStatusQuery,
    sortBy,
    sortOrder,
  })

  // Mutations
  const blockUserMutation = useBlockUser()
  const approveTeacherMutation = useApproveTeacher()

  // Query all teachers for accurate metric counts and tab badges
  const { data: allTeachersResponse } = useUsers({
    role: "TEACHER",
    limit: 100,
  })

  const teachers = usersResponse?.data?.users || []
  const totalItems = usersResponse?.data?.total ?? 0

  const allTeachersList = allTeachersResponse?.data?.users || []
  const globalCounts = useMemo(() => {
    const total = allTeachersResponse?.data?.total ?? totalItems

    let pending = 0
    let inProgress = 0
    let verified = 0
    let redo = 0
    let revoked = 0

    allTeachersList.forEach((t) => {
      const status: ApprovalStatus =
        t.profile?.teacherProfile?.approvalStatus ||
        (t.profile?.teacherProfile?.isApproved ? "VERIFIED" : "PENDING")

      if (status === "VERIFIED") verified++
      else if (status === "IN_PROGRESS") inProgress++
      else if (status === "REDO") redo++
      else if (status === "REVOKED") revoked++
      else pending++
    })

    const google = allTeachersList.filter((t) => t.authProvider === "GOOGLE").length
    const local = allTeachersList.filter((t) => t.authProvider === "LOCAL").length

    return {
      total,
      pending,
      inProgress,
      verified,
      redo,
      revoked,
      google,
      local,
    }
  }, [allTeachersResponse, allTeachersList, totalItems])

  const handleOpenBlockModal = (teacherId: string) => {
    const teacher =
      teachers.find((t) => t.id === teacherId) ||
      (selectedTeacher?.id === teacherId ? selectedTeacher : null)
    if (teacher) {
      setTeacherToBlock(teacher)
    }
  }

  const handleConfirmBlock = async () => {
    if (!teacherToBlock) return
    const targetTeacherId = teacherToBlock.id
    const res = await blockUserMutation.mutateAsync(targetTeacherId)
    setTeacherToBlock(null)
    if (selectedTeacher?.id === targetTeacherId) {
      if (res?.data?.user) {
        setSelectedTeacher(res.data.user)
      } else {
        setSelectedTeacher((prev) => (prev ? { ...prev, isBlocked: !prev.isBlocked } : null))
      }
    }
  }

  const handleOpenApproveModal = (
    teacherId: string,
    targetStatus?: ApprovalStatus | boolean
  ) => {
    const teacher =
      teachers.find((t) => t.id === teacherId) ||
      (selectedTeacher?.id === teacherId ? selectedTeacher : null)
    if (teacher) {
      setTeacherToApprove({ user: teacher, targetStatus })
    }
  }

  const handleConfirmApprove = async (data: {
    approvalStatus: ApprovalStatus
    isApproved: boolean
    rejectionReason?: string | null
  }) => {
    if (!teacherToApprove) return
    const { user } = teacherToApprove
    const res = await approveTeacherMutation.mutateAsync({
      id: user.id,
      approvalStatus: data.approvalStatus,
      isApproved: data.isApproved,
      rejectionReason: data.rejectionReason,
    })
    setTeacherToApprove(null)
    if (selectedTeacher?.id === user.id) {
      if (res?.data?.user) {
        setSelectedTeacher(res.data.user)
      } else {
        setSelectedTeacher((prev) => {
          if (!prev) return null
          return {
            ...prev,
            profile: prev.profile
              ? {
                  ...prev.profile,
                  teacherProfile: prev.profile.teacherProfile
                    ? {
                        ...prev.profile.teacherProfile,
                        approvalStatus: data.approvalStatus,
                        isApproved: data.isApproved,
                        rejectionReason: data.rejectionReason ?? null,
                      }
                    : undefined,
                }
              : undefined,
          }
        })
      }
    }
  }

  const handleResetFilters = () => {
    setSearchQuery("")
    setApprovalFilter("all")
    setAuthProviderFilter("all")
    setSortOption("newest")
    setCurrentPage(1)
  }

  const hasActiveFilters =
    Boolean(searchQuery) ||
    approvalFilter !== "all" ||
    authProviderFilter !== "all" ||
    sortOption !== "newest"

  // Metrics
  const metrics: TableMetricCard[] = [
    { label: "Total Instructors", val: globalCounts.total, icon: Users, color: "text-[#F42A18]" },
    { label: "Pending Verification", val: globalCounts.pending, icon: AlertCircle, color: "text-amber-500" },
    { label: "In Evaluation", val: globalCounts.inProgress, icon: Clock, color: "text-blue-500" },
    { label: "Verified Instructors", val: globalCounts.verified, icon: CheckCircle2, color: "text-emerald-500" },
  ]

  // Columns Configuration
  const columns: TableColumn<BackendUser>[] = [
    {
      header: "Instructor",
      cell: (teacher) => {
        const initials = teacher.name
          ? teacher.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase()
          : "IN"

        return (
          <div className="flex items-center gap-3">
            {teacher.profile?.avatar ? (
              <img
                src={teacher.profile.avatar}
                alt={teacher.name}
                className="w-9 h-9 rounded-xl object-cover border border-neutral-200 dark:border-neutral-800 shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-bold text-xs flex items-center justify-center shrink-0">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <div className="font-semibold text-neutral-900 dark:text-white truncate flex items-center gap-1.5">
                <span>{teacher.name}</span>
                {teacher.isBlocked && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500/10 text-red-500 font-medium border border-red-500/20">
                    Blocked
                  </span>
                )}
              </div>
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                {teacher.email}
              </div>
            </div>
          </div>
        )
      },
    },
    {
      header: "Lifecycle Status",
      align: "center",
      cell: (teacher) => {
        const status: ApprovalStatus =
          teacher.profile?.teacherProfile?.approvalStatus ||
          (teacher.profile?.teacherProfile?.isApproved ? "VERIFIED" : "PENDING")

        switch (status) {
          case "VERIFIED":
            return (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified
              </span>
            )
          case "IN_PROGRESS":
            return (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <Clock className="w-3.5 h-3.5" />
                In Progress
              </span>
            )
          case "REDO":
            return (
              <div className="flex flex-col items-center gap-0.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                  <RotateCcw className="w-3.5 h-3.5" />
                  Needs Revision
                </span>
                {teacher.profile?.teacherProfile?.rejectionReason && (
                  <span className="text-[10px] text-orange-600/80 dark:text-orange-400/80 flex items-center gap-0.5 font-medium">
                    <MessageSquare className="w-2.5 h-2.5" />
                    Feedback Given
                  </span>
                )}
              </div>
            )
          case "REVOKED":
            return (
              <div className="flex flex-col items-center gap-0.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  <UserX className="w-3.5 h-3.5" />
                  Revoked
                </span>
                {teacher.profile?.teacherProfile?.rejectionReason && (
                  <span className="text-[10px] text-rose-600/80 dark:text-rose-400/80 flex items-center gap-0.5 font-medium">
                    <MessageSquare className="w-2.5 h-2.5" />
                    Feedback Given
                  </span>
                )}
              </div>
            )
          case "PENDING":
          default:
            return (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <AlertCircle className="w-3.5 h-3.5" />
                Pending Review
              </span>
            )
        }
      },
    },
    {
      header: "Role",
      align: "center",
      cell: () => (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          Instructor
        </span>
      ),
    },
    {
      header: "Sign-in Method",
      align: "center",
      cell: (teacher) => (
        <div className="whitespace-nowrap">
          {teacher.authProvider === "GOOGLE" ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <Globe className="w-3 h-3" />
              Google Account
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-purple-500/10 text-purple-500 border border-purple-500/20">
              <KeyRound className="w-3 h-3" />
              Email & Password
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Joined Date",
      align: "center",
      cell: (teacher) => {
        const formatted = teacher.createdAt
          ? new Date(teacher.createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "—"

        return (
          <div className="text-xs text-neutral-600 dark:text-neutral-300 flex items-center gap-1.5 whitespace-nowrap">
            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
            <span>{formatted}</span>
          </div>
        )
      },
    },
    {
      header: "Actions",
      align: "right",
      cell: (teacher) => (
        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedTeacher(teacher)}
            className="h-8 px-2.5 text-xs rounded-lg border-neutral-200 dark:border-neutral-800 hover:border-[#F42A18] hover:text-[#F42A18]"
          >
            Details
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenApproveModal(teacher.id)}
            title="Update Approval & Verification Status"
            className="h-8 px-2 text-xs rounded-lg border-neutral-200 dark:border-neutral-800 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Status</span>
          </Button>

          <button
            type="button"
            onClick={() => handleOpenBlockModal(teacher.id)}
            title={teacher.isBlocked ? "Unblock Instructor Account" : "Block Instructor Account"}
            className={`h-8 w-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
              teacher.isBlocked
                ? "text-red-500 bg-red-500/10 hover:bg-red-500/20"
                : "text-neutral-400 hover:text-red-500 hover:bg-red-500/10"
            }`}
          >
            <Ban className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  // Modals (Details Drawer & Confirmation Modals)
  const modalContent = (
    <>
      <UserDetailsDrawer
        user={selectedTeacher}
        onClose={() => setSelectedTeacher(null)}
        titleFallback="Instructor Profile"
        initialsFallback="IN"
        onBlock={handleOpenBlockModal}
        isBlocking={blockUserMutation.isPending}
        onApprove={handleOpenApproveModal}
        isApproving={approveTeacherMutation.isPending}
      />

      <VerifyTeacherModal
        user={teacherToApprove?.user || null}
        targetStatus={teacherToApprove?.targetStatus}
        isOpen={Boolean(teacherToApprove)}
        onClose={() => setTeacherToApprove(null)}
        onConfirm={handleConfirmApprove}
        isLoading={approveTeacherMutation.isPending}
      />

      <BlockUserModal
        user={teacherToBlock}
        isOpen={Boolean(teacherToBlock)}
        onClose={() => setTeacherToBlock(null)}
        onConfirm={handleConfirmBlock}
        isLoading={blockUserMutation.isPending}
        roleLabel="Instructor"
      />
    </>
  )

  return (
    <DataTableTemplate<BackendUser>
      badge={{
        icon: ShieldCheck,
        label: "Instructor Verification & Directory",
      }}
      title="Teacher Directory"
      description="Review instructor credentials, evaluate applications, request revisions, and manage verified instructor status."
      headerActions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh Data"
            className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-[#F42A18] text-neutral-600 dark:text-neutral-400 hover:text-[#F42A18] transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-[#F42A18]" : ""}`} />
          </button>
          <span className="px-3.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 text-xs font-semibold border border-emerald-500/20 flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>{totalItems} Instructors</span>
          </span>
        </div>
      }
      metrics={metrics}
      searchPlaceholder="Search instructors by name or email..."
      searchQuery={searchQuery}
      onSearchChange={(q) => {
        setSearchQuery(q)
        setCurrentPage(1)
      }}
      tabs={[
        { key: "all", label: "All Instructors", count: globalCounts.total },
        { key: "PENDING", label: "Pending", count: globalCounts.pending },
        { key: "IN_PROGRESS", label: "In Progress", count: globalCounts.inProgress },
        { key: "VERIFIED", label: "Verified", count: globalCounts.verified },
        { key: "REDO", label: "Needs Revision", count: globalCounts.redo },
        { key: "REVOKED", label: "Revoked", count: globalCounts.revoked },
      ]}
      activeTab={approvalFilter}
      onTabChange={(k) => {
        setApprovalFilter(k)
        setCurrentPage(1)
      }}
      dropdownFilters={[
        {
          key: "verificationStatus",
          value: approvalFilter,
          onChange: (val) => {
            setApprovalFilter(val)
            setCurrentPage(1)
          },
          options: [
            { label: "All Approval Statuses", value: "all" },
            { label: "Pending Verification", value: "PENDING" },
            { label: "In Progress (Evaluation)", value: "IN_PROGRESS" },
            { label: "Verified Instructors", value: "VERIFIED" },
            { label: "Needs Revision (Redo)", value: "REDO" },
            { label: "Verification Revoked", value: "REVOKED" },
          ],
        },
        {
          key: "authProvider",
          value: authProviderFilter,
          onChange: (val) => {
            setAuthProviderFilter(val)
            setCurrentPage(1)
          },
          options: [
            { label: "All Sign-in Methods", value: "all" },
            { label: "Google Account", value: "GOOGLE" },
            { label: "Email & Password", value: "LOCAL" },
          ],
        },
      ]}
      sortOptions={[
        { label: "Joined: Newest First", value: "newest" },
        { label: "Joined: Oldest First", value: "oldest" },
        { label: "Name: A to Z", value: "name-asc" },
        { label: "Email: A to Z", value: "email-asc" },
      ]}
      currentSort={sortOption}
      onSortChange={(val) => {
        setSortOption(val)
        setCurrentPage(1)
      }}
      hasActiveFilters={hasActiveFilters}
      onResetFilters={handleResetFilters}
      columns={columns}
      data={teachers}
      keyExtractor={(t) => t.id}
      isLoading={isLoading}
      emptyState={{
        title: isError ? "Unable to load instructors" : "No instructors found",
        description: isError
          ? (error as any)?.message ||
            "Failed to fetch instructors from the server. Please verify your admin credentials."
          : approvalFilter === "PENDING"
          ? "There are currently no instructor profiles awaiting initial verification."
          : approvalFilter === "IN_PROGRESS"
          ? "There are no instructor profiles currently marked as in progress."
          : approvalFilter === "VERIFIED"
          ? "No verified instructor accounts found matching the criteria."
          : approvalFilter === "REDO"
          ? "No instructor accounts currently have revision requests pending."
          : approvalFilter === "REVOKED"
          ? "No instructor accounts with revoked verification found."
          : "No instructor records matching your search or filters were found.",
      }}
      pagination={{
        currentPage,
        pageSize,
        totalItems,
        onPageChange: (p) => setCurrentPage(p),
        onPageSizeChange: (s) => {
          setPageSize(s)
          setCurrentPage(1)
        },
        pageSizeOptions: [5, 10, 20, 50],
      }}
      modal={modalContent}
    />
  )
}

export default AdminTeachersPage
