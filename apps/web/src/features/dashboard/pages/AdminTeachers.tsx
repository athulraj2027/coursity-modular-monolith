import { useState, useMemo } from "react"
import {
  CheckCircle2,
  Clock,
  AlertOctagon,
  ExternalLink,
  Star,
  Users,
  DollarSign,
  ShieldCheck,
  Check,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DataTableTemplate,
  type TableColumn,
  type TableMetricCard,
} from "@/components/common"

export interface TeacherRecord {
  id: string
  name: string
  email: string
  avatar?: string
  specialization: string
  domain: string
  experience: string
  github: string
  status: "verified" | "pending" | "suspended"
  activeCourses: number
  totalStudents: number
  rating: number
  totalEarnings: string
  joinedDate: string
}

const INITIAL_TEACHERS: TeacherRecord[] = [
  {
    id: "t-1",
    name: "Dr. Aris Thorne",
    email: "aris.thorne@coursity.io",
    specialization: "Distributed Consensus & Raft Protocols",
    domain: "Distributed Systems",
    experience: "Ex-Google Staff SRE (9 yrs)",
    github: "github.com/aris-thorne",
    status: "verified",
    activeCourses: 3,
    totalStudents: 1420,
    rating: 4.96,
    totalEarnings: "$64,200",
    joinedDate: "Jan 12, 2026",
  },
  {
    id: "t-2",
    name: "Elena Rostova",
    email: "elena@neural.ai",
    specialization: "AI Agents & Autonomous Evaluations",
    domain: "AI & ML",
    experience: "Stanford PhD / Anthropic Contributor",
    github: "github.com/erostova",
    status: "pending",
    activeCourses: 1,
    totalStudents: 340,
    rating: 4.88,
    totalEarnings: "$12,800",
    joinedDate: "Feb 28, 2026",
  },
  {
    id: "t-3",
    name: "David K. Chen",
    email: "david@chen.dev",
    specialization: "High-Throughput Rust Microservices",
    domain: "Rust & Systems",
    experience: "Principal Engineer at Datadog",
    github: "github.com/davidkchen",
    status: "verified",
    activeCourses: 4,
    totalStudents: 2180,
    rating: 4.94,
    totalEarnings: "$98,450",
    joinedDate: "Nov 14, 2025",
  },
  {
    id: "t-4",
    name: "Sophia Martinez",
    email: "sophia.m@cloudscale.io",
    specialization: "Kubernetes Operators & eBPF Observability",
    domain: "Cloud & DevOps",
    experience: "Kubernetes Core SIG-Node Lead",
    github: "github.com/smartinez-k8s",
    status: "verified",
    activeCourses: 2,
    totalStudents: 890,
    rating: 4.91,
    totalEarnings: "$41,300",
    joinedDate: "Dec 03, 2025",
  },
  {
    id: "t-5",
    name: "Tariq Al-Mansoor",
    email: "tariq@crypto-core.org",
    specialization: "Zero Knowledge Proofs & SNARK Circuits",
    domain: "Cryptography",
    experience: "Ethereum Foundation Fellow",
    github: "github.com/tariq-zk",
    status: "pending",
    activeCourses: 1,
    totalStudents: 180,
    rating: 4.85,
    totalEarnings: "$6,900",
    joinedDate: "Mar 02, 2026",
  },
  {
    id: "t-6",
    name: "Ingrid Blomqvist",
    email: "ingrid@nordic-sec.se",
    specialization: "Offensive Security & Kernel Exploitation",
    domain: "Security",
    experience: "DefCon Speaker & Security Researcher",
    github: "github.com/ingrid-sec",
    status: "verified",
    activeCourses: 3,
    totalStudents: 1640,
    rating: 4.98,
    totalEarnings: "$78,100",
    joinedDate: "Oct 19, 2025",
  },
  {
    id: "t-7",
    name: "Vikram Sengupta",
    email: "vikram@bytecraft.in",
    specialization: "Database Storage Engines (LSM & B-Trees)",
    domain: "Distributed Systems",
    experience: "Author of RocksDB Internals",
    github: "github.com/vsengupta",
    status: "pending",
    activeCourses: 1,
    totalStudents: 220,
    rating: 4.79,
    totalEarnings: "$8,400",
    joinedDate: "Mar 01, 2026",
  },
  {
    id: "t-8",
    name: "Lucas Beaumont",
    email: "lucas@webgl-studio.fr",
    specialization: "Real-time Graphics with WebGPU & Shaders",
    domain: "Graphics & UI",
    experience: "Former Three.js Core Committer",
    github: "github.com/lbeaumont",
    status: "suspended",
    activeCourses: 1,
    totalStudents: 510,
    rating: 4.21,
    totalEarnings: "$15,200",
    joinedDate: "Aug 15, 2025",
  },
  {
    id: "t-9",
    name: "Dr. Maya Lin",
    email: "maya.lin@quantum.edu",
    specialization: "Quantum Algorithms & Qiskit Simulators",
    domain: "Quantum & AI",
    experience: "MIT CSAIL Postdoc",
    github: "github.com/mayalin-q",
    status: "verified",
    activeCourses: 2,
    totalStudents: 720,
    rating: 4.93,
    totalEarnings: "$34,500",
    joinedDate: "Jan 05, 2026",
  },
  {
    id: "t-10",
    name: "Gavin Ross",
    email: "gavin@compiler-lab.io",
    specialization: "LLVM Backend Optimization & JIT Compilers",
    domain: "Rust & Systems",
    experience: "Ex-Apple CoreOS Engineer",
    github: "github.com/gavinross-llvm",
    status: "verified",
    activeCourses: 3,
    totalStudents: 1150,
    rating: 4.97,
    totalEarnings: "$58,900",
    joinedDate: "Dec 18, 2025",
  },
]

export const AdminTeachersPage = () => {
  const [teachers, setTeachers] = useState<TeacherRecord[]>(INITIAL_TEACHERS)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "verified" | "pending" | "suspended">("all")
  const [domainFilter, setDomainFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"students" | "rating" | "earnings" | "name">("students")
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherRecord | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  // Count helper
  const counts = useMemo(
    () => ({
      all: teachers.length,
      verified: teachers.filter((t) => t.status === "verified").length,
      pending: teachers.filter((t) => t.status === "pending").length,
      suspended: teachers.filter((t) => t.status === "suspended").length,
    }),
    [teachers]
  )

  // Filter & Sort Logic
  const filteredTeachers = useMemo(() => {
    return teachers
      .filter((teacher) => {
        const matchesSearch =
          teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          teacher.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
          teacher.experience.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesStatus = statusFilter === "all" || teacher.status === statusFilter
        const matchesDomain = domainFilter === "all" || teacher.domain === domainFilter

        return matchesSearch && matchesStatus && matchesDomain
      })
      .sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name)
        if (sortBy === "students") return b.totalStudents - a.totalStudents
        if (sortBy === "rating") return b.rating - a.rating
        if (sortBy === "earnings") {
          const numA = parseInt(a.totalEarnings.replace(/[^0-9]/g, ""), 10)
          const numB = parseInt(b.totalEarnings.replace(/[^0-9]/g, ""), 10)
          return numB - numA
        }
        return 0
      })
  }, [teachers, searchQuery, statusFilter, domainFilter, sortBy])

  // Paginated Slice
  const paginatedTeachers = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredTeachers.slice(start, start + pageSize)
  }, [filteredTeachers, currentPage, pageSize])

  const handleUpdateStatus = (id: string, newStatus: "verified" | "pending" | "suspended") => {
    setTeachers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    )
    if (selectedTeacher && selectedTeacher.id === id) {
      setSelectedTeacher((prev) => (prev ? { ...prev, status: newStatus } : null))
    }
  }

  const handleResetFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setDomainFilter("all")
    setSortBy("students")
    setCurrentPage(1)
  }

  const hasActiveFilters =
    Boolean(searchQuery) || statusFilter !== "all" || domainFilter !== "all" || sortBy !== "students"

  // Metrics
  const metrics: TableMetricCard[] = [
    { label: "Total Instructors", val: counts.all, icon: Users, color: "text-[#F42A18]" },
    { label: "Verified Hosts", val: counts.verified, icon: CheckCircle2, color: "text-emerald-500" },
    { label: "Pending Verification", val: counts.pending, icon: Clock, color: "text-amber-500" },
    { label: "Platform GMV Shared", val: "$307,450", icon: DollarSign, color: "text-blue-500" },
  ]

  // Columns Configuration
  const columns: TableColumn<TeacherRecord>[] = [
    {
      header: "Instructor",
      cell: (teacher) => {
        const initials = teacher.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .substring(0, 2)

        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-bold text-xs flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-neutral-900 dark:text-white truncate">
                {teacher.name}
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
      header: "Specialization",
      className: "max-w-xs",
      cell: (teacher) => (
        <div>
          <div className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">
            {teacher.specialization}
          </div>
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
            {teacher.experience}
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      align: "center",
      cell: (teacher) => (
        <div className="whitespace-nowrap">
          {teacher.status === "verified" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <CheckCircle2 className="w-3 h-3" />
              Verified
            </span>
          )}
          {teacher.status === "pending" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Clock className="w-3 h-3" />
              Pending
            </span>
          )}
          {teacher.status === "suspended" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/10 text-red-500 border border-red-500/20">
              <AlertOctagon className="w-3 h-3" />
              Suspended
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Courses",
      align: "center",
      cell: (teacher) => (
        <span className="font-medium text-neutral-800 dark:text-neutral-200">
          {teacher.activeCourses}
        </span>
      ),
    },
    {
      header: "Students",
      align: "center",
      cell: (teacher) => (
        <span className="font-semibold text-neutral-900 dark:text-white">
          {teacher.totalStudents.toLocaleString()}
        </span>
      ),
    },
    {
      header: "Rating",
      align: "center",
      cell: (teacher) => (
        <div className="inline-flex items-center gap-1 text-xs font-semibold text-amber-500">
          <Star className="w-3 h-3 fill-current" />
          <span>{teacher.rating.toFixed(2)}</span>
        </div>
      ),
    },
    {
      header: "Revenue",
      align: "right",
      cell: (teacher) => (
        <span className="font-semibold text-neutral-900 dark:text-white">
          {teacher.totalEarnings}
        </span>
      ),
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

          {teacher.status === "pending" ? (
            <button
              type="button"
              onClick={() => handleUpdateStatus(teacher.id, "verified")}
              title="Approve Instructor"
              className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 flex items-center justify-center cursor-pointer transition-colors"
            >
              <Check className="w-4 h-4" />
            </button>
          ) : teacher.status === "verified" ? (
            <button
              type="button"
              onClick={() => handleUpdateStatus(teacher.id, "suspended")}
              title="Suspend Instructor"
              className="h-8 w-8 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-500/10 flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleUpdateStatus(teacher.id, "verified")}
              title="Re-activate Instructor"
              className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 flex items-center justify-center cursor-pointer transition-colors"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ]

  // Details Modal
  const modalContent = selectedTeacher && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F42A18]/10 text-[#F42A18] font-bold text-base flex items-center justify-center">
              {selectedTeacher.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                {selectedTeacher.name}
              </h3>
              <p className="text-xs text-neutral-500">{selectedTeacher.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSelectedTeacher(null)}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Overview */}
        <div className="space-y-3 py-1 text-xs">
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200/80 dark:border-neutral-800 space-y-1">
            <div className="text-[11px] uppercase font-semibold text-neutral-400">
              Specialization & Background
            </div>
            <div className="font-semibold text-neutral-900 dark:text-white">
              {selectedTeacher.specialization}
            </div>
            <div className="text-neutral-500">{selectedTeacher.experience}</div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800">
              <div className="text-neutral-500 text-[10px] uppercase font-semibold">
                Active Cohorts
              </div>
              <div className="text-base font-bold text-neutral-900 dark:text-white">
                {selectedTeacher.activeCourses} Tracks
              </div>
            </div>
            <div className="p-2.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800">
              <div className="text-neutral-500 text-[10px] uppercase font-semibold">
                Students Mentored
              </div>
              <div className="text-base font-bold text-neutral-900 dark:text-white">
                {selectedTeacher.totalStudents.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs py-1 border-t border-neutral-200 dark:border-neutral-800">
            <span className="text-neutral-500">GitHub Portfolio:</span>
            <a
              href={`https://${selectedTeacher.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[#F42A18] hover:underline flex items-center gap-1"
            >
              <span>{selectedTeacher.github}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center justify-between text-xs py-1 border-t border-neutral-200 dark:border-neutral-800">
            <span className="text-neutral-500">Joined Platform:</span>
            <span className="font-medium text-neutral-800 dark:text-neutral-200">
              {selectedTeacher.joinedDate}
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
          {selectedTeacher.status === "pending" && (
            <Button
              type="button"
              onClick={() => handleUpdateStatus(selectedTeacher.id, "verified")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl"
            >
              <Check className="w-3.5 h-3.5 mr-1" />
              Approve Application
            </Button>
          )}

          {selectedTeacher.status === "verified" && (
            <Button
              type="button"
              variant="outline"
              onClick={() => handleUpdateStatus(selectedTeacher.id, "suspended")}
              className="text-red-500 border-red-500/30 hover:bg-red-500/10 text-xs rounded-xl"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Suspend Access
            </Button>
          )}

          {selectedTeacher.status === "suspended" && (
            <Button
              type="button"
              onClick={() => handleUpdateStatus(selectedTeacher.id, "verified")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl"
            >
              <Check className="w-3.5 h-3.5 mr-1" />
              Re-activate
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={() => setSelectedTeacher(null)}
            className="text-xs rounded-xl border-neutral-200 dark:border-neutral-800"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <DataTableTemplate<TeacherRecord>
      badge={{
        icon: ShieldCheck,
        label: "Instructor Verification & Roster",
      }}
      title="Teacher Directory"
      description="Manage instructors, verify creator credentials, and monitor cohort delivery standards across all tracks."
      headerActions={
        <span className="px-3.5 py-2 rounded-xl bg-amber-500/10 text-amber-500 text-xs font-semibold border border-amber-500/20 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>{counts.pending} Applications Pending</span>
        </span>
      }
      metrics={metrics}
      searchPlaceholder="Search by instructor name, email, credentials, or domain..."
      searchQuery={searchQuery}
      onSearchChange={(q) => {
        setSearchQuery(q)
        setCurrentPage(1)
      }}
      tabs={[
        { key: "all", label: "All", count: counts.all },
        { key: "verified", label: "Verified", count: counts.verified },
        { key: "pending", label: "Pending", count: counts.pending },
        { key: "suspended", label: "Suspended", count: counts.suspended },
      ]}
      activeTab={statusFilter}
      onTabChange={(k) => {
        setStatusFilter(k as any)
        setCurrentPage(1)
      }}
      dropdownFilters={[
        {
          key: "domain",
          value: domainFilter,
          onChange: (val) => {
            setDomainFilter(val)
            setCurrentPage(1)
          },
          options: [
            { label: "All Domains", value: "all" },
            { label: "Distributed Systems", value: "Distributed Systems" },
            { label: "AI & ML", value: "AI & ML" },
            { label: "Rust & Systems", value: "Rust & Systems" },
            { label: "Cloud & DevOps", value: "Cloud & DevOps" },
            { label: "Security", value: "Security" },
            { label: "Cryptography", value: "Cryptography" },
          ],
        },
      ]}
      sortOptions={[
        { label: "Sort: Most Students", value: "students" },
        { label: "Sort: Highest Rating", value: "rating" },
        { label: "Sort: Top Revenue", value: "earnings" },
        { label: "Sort: Name (A-Z)", value: "name" },
      ]}
      currentSort={sortBy}
      onSortChange={(val) => setSortBy(val as any)}
      hasActiveFilters={hasActiveFilters}
      onResetFilters={handleResetFilters}
      columns={columns}
      data={paginatedTeachers}
      keyExtractor={(t) => t.id}
      pagination={{
        currentPage,
        pageSize,
        totalItems: filteredTeachers.length,
        onPageChange: (p) => setCurrentPage(p),
        onPageSizeChange: (s) => {
          setPageSize(s)
          setCurrentPage(1)
        },
        pageSizeOptions: [5, 10, 20],
      }}
      modal={modalContent}
    />
  )
}

export default AdminTeachersPage
