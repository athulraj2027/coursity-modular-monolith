import { useState, useMemo } from "react"
import {
  Users,
  ShieldCheck,
  Ban,
  RefreshCw,
  Calendar,
  KeyRound,
  Globe,
  Clock,
  GraduationCap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DataTableTemplate,
  UserDetailsDrawer,
  BlockUserModal,
  type TableColumn,
  type TableMetricCard,
} from "@/components/common"
import { useUsers, useBlockUser } from "../hooks/useUsers"
import { useDebounce } from "@/hooks/use-debounce"
import type { BackendUser, AuthProvider } from "../types/user-management.types"

export const AdminTeachersPage = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 300)

  const [authProviderFilter, setAuthProviderFilter] = useState<string>("all")
  const [sortOption, setSortOption] = useState<string>("newest")
  const [selectedTeacher, setSelectedTeacher] = useState<BackendUser | null>(null)
  const [teacherToBlock, setTeacherToBlock] = useState<BackendUser | null>(null)

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

  // Real backend query
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
    sortBy,
    sortOrder,
  })

  // Block mutation
  const blockUserMutation = useBlockUser()

  const teachers = usersResponse?.data?.users || []
  const totalItems = usersResponse?.data?.total ?? 0

  // Count helper
  const counts = useMemo(() => {
    const googleCount = teachers.filter((t) => t.authProvider === "GOOGLE").length
    const localCount = teachers.filter((t) => t.authProvider === "LOCAL").length
    return {
      all: totalItems,
      google: googleCount,
      local: localCount,
    }
  }, [totalItems, teachers])

  const handleOpenBlockModal = (teacherId: string) => {
    const teacher = teachers.find((t) => t.id === teacherId) || (selectedTeacher?.id === teacherId ? selectedTeacher : null)
    if (teacher) {
      setTeacherToBlock(teacher)
    }
  }

  const handleConfirmBlock = async () => {
    if (!teacherToBlock) return
    await blockUserMutation.mutateAsync(teacherToBlock.id)
    setTeacherToBlock(null)
    if (selectedTeacher?.id === teacherToBlock.id) {
      setSelectedTeacher(null)
    }
  }

  const handleResetFilters = () => {
    setSearchQuery("")
    setAuthProviderFilter("all")
    setSortOption("newest")
    setCurrentPage(1)
  }

  const hasActiveFilters = Boolean(searchQuery) || authProviderFilter !== "all" || sortOption !== "newest"

  // Metrics
  const metrics: TableMetricCard[] = [
    { label: "Total Instructors", val: totalItems, icon: Users, color: "text-[#F42A18]" },
    { label: "Active on Page", val: teachers.length, icon: GraduationCap, color: "text-emerald-500" },
    { label: "Google OAuth Hosts", val: counts.google, icon: Globe, color: "text-blue-500" },
    { label: "Email / Local Hosts", val: counts.local, icon: KeyRound, color: "text-purple-500" },
  ]

  // Columns Configuration matching database schema
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
            <div className="w-9 h-9 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-bold text-xs flex items-center justify-center shrink-0">
              {initials}
            </div>
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
      header: "System Role",
      align: "center",
      cell: (teacher) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          {teacher.role}
        </span>
      ),
    },
    {
      header: "Auth Provider",
      align: "center",
      cell: (teacher) => (
        <div className="whitespace-nowrap">
          {teacher.authProvider === "GOOGLE" ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <Globe className="w-3 h-3" />
              Google OAuth
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
      header: "Last Updated",
      align: "center",
      cell: (teacher) => {
        const formatted = teacher.updatedAt
          ? new Date(teacher.updatedAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "—"

        return (
          <div className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 whitespace-nowrap">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
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

  // Modals (Details Drawer & Confirmation Modal)
  const modalContent = (
    <>
      <UserDetailsDrawer
        user={selectedTeacher}
        onClose={() => setSelectedTeacher(null)}
        titleFallback="Instructor Record"
        initialsFallback="IN"
        onBlock={handleOpenBlockModal}
        isBlocking={blockUserMutation.isPending}
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
        label: "Instructor Verification & Roster",
      }}
      title="Teacher Directory"
      description="Manage and inspect instructor accounts registered in the database."
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
        { key: "all", label: "All Instructors", count: totalItems },
        { key: "GOOGLE", label: "Google OAuth" },
        { key: "LOCAL", label: "Email & Password" },
      ]}
      activeTab={authProviderFilter}
      onTabChange={(k) => {
        setAuthProviderFilter(k)
        setCurrentPage(1)
      }}
      dropdownFilters={[
        {
          key: "authProvider",
          value: authProviderFilter,
          onChange: (val) => {
            setAuthProviderFilter(val)
            setCurrentPage(1)
          },
          options: [
            { label: "All Providers", value: "all" },
            { label: "Google OAuth", value: "GOOGLE" },
            { label: "Email / Password", value: "LOCAL" },
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
          ? (error as any)?.message || "Failed to fetch instructors from the server. Please verify your admin credentials."
          : "No teacher records matching your search or filters were returned from the database.",
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
