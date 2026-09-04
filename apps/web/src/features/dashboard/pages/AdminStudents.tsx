import { useState, useMemo } from "react"
import {
  Users,
  Sparkles,
  Zap,
  BookOpen,
  Award,
  ShieldCheck,
  Globe,
  X,
  GraduationCap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DataTableTemplate,
  type TableColumn,
  type TableMetricCard,
} from "@/components/common"

export interface StudentRecord {
  id: string
  name: string
  email: string
  avatar?: string
  plan: "pro" | "cohort" | "free"
  track: string
  progress: number
  aiLabScore: number
  labsCompleted: number
  country: string
  lastActive: string
  joinedDate: string
  status: "active" | "inactive"
}

const INITIAL_STUDENTS: StudentRecord[] = [
  {
    id: "s-1",
    name: "Alex Rivera",
    email: "alex.rivera@gmail.com",
    plan: "cohort",
    track: "Distributed Systems & Raft",
    progress: 88,
    aiLabScore: 98,
    labsCompleted: 24,
    country: "United States",
    lastActive: "12 mins ago",
    joinedDate: "Jan 10, 2026",
    status: "active",
  },
  {
    id: "s-2",
    name: "Priya Sharma",
    email: "priya.sharma@tech.in",
    plan: "pro",
    track: "Full Stack AI & Autonomous Agents",
    progress: 94,
    aiLabScore: 100,
    labsCompleted: 31,
    country: "India",
    lastActive: "2 hours ago",
    joinedDate: "Dec 04, 2025",
    status: "active",
  },
  {
    id: "s-3",
    name: "Liam O'Connor",
    email: "liam.oc@dublin-dev.ie",
    plan: "pro",
    track: "High-Throughput Rust Microservices",
    progress: 65,
    aiLabScore: 91,
    labsCompleted: 18,
    country: "Ireland",
    lastActive: "5 hours ago",
    joinedDate: "Jan 22, 2026",
    status: "active",
  },
  {
    id: "s-4",
    name: "Yuki Tanaka",
    email: "yuki.t@tokyo-eng.jp",
    plan: "cohort",
    track: "Kubernetes Operators & eBPF",
    progress: 76,
    aiLabScore: 95,
    labsCompleted: 20,
    country: "Japan",
    lastActive: "1 day ago",
    joinedDate: "Feb 02, 2026",
    status: "active",
  },
  {
    id: "s-5",
    name: "Mateo Silva",
    email: "mateo@silva-dev.br",
    plan: "free",
    track: "Zero Knowledge Proofs & Cryptography",
    progress: 32,
    aiLabScore: 84,
    labsCompleted: 8,
    country: "Brazil",
    lastActive: "3 days ago",
    joinedDate: "Feb 19, 2026",
    status: "active",
  },
  {
    id: "s-6",
    name: "Zoe Chen",
    email: "zoe.chen@vancouver.ca",
    plan: "pro",
    track: "Full Stack AI & Autonomous Agents",
    progress: 100,
    aiLabScore: 99,
    labsCompleted: 35,
    country: "Canada",
    lastActive: "Just now",
    joinedDate: "Nov 15, 2025",
    status: "active",
  },
  {
    id: "s-7",
    name: "Hassan Farooq",
    email: "hassan.f@karachi.pk",
    plan: "cohort",
    track: "Distributed Systems & Raft",
    progress: 45,
    aiLabScore: 89,
    labsCompleted: 12,
    country: "Pakistan",
    lastActive: "4 hours ago",
    joinedDate: "Feb 11, 2026",
    status: "active",
  },
  {
    id: "s-8",
    name: "Clara Hoffmann",
    email: "clara@berlin-tech.de",
    plan: "free",
    track: "High-Throughput Rust Microservices",
    progress: 15,
    aiLabScore: 78,
    labsCompleted: 4,
    country: "Germany",
    lastActive: "1 week ago",
    joinedDate: "Mar 01, 2026",
    status: "inactive",
  },
  {
    id: "s-9",
    name: "Dmitri Volkov",
    email: "dmitri.v@helsinki.fi",
    plan: "pro",
    track: "Distributed Systems & Raft",
    progress: 92,
    aiLabScore: 97,
    labsCompleted: 28,
    country: "Finland",
    lastActive: "30 mins ago",
    joinedDate: "Jan 18, 2026",
    status: "active",
  },
  {
    id: "s-10",
    name: "Amina Diallo",
    email: "amina.diallo@dakar-code.sn",
    plan: "cohort",
    track: "Full Stack AI & Autonomous Agents",
    progress: 81,
    aiLabScore: 94,
    labsCompleted: 22,
    country: "Senegal",
    lastActive: "6 hours ago",
    joinedDate: "Feb 05, 2026",
    status: "active",
  },
  {
    id: "s-11",
    name: "Lucas Rossi",
    email: "lucas.rossi@milano.it",
    plan: "free",
    track: "Kubernetes Operators & eBPF",
    progress: 25,
    aiLabScore: 80,
    labsCompleted: 6,
    country: "Italy",
    lastActive: "2 days ago",
    joinedDate: "Feb 24, 2026",
    status: "active",
  },
  {
    id: "s-12",
    name: "Min-Jun Kim",
    email: "minjun.kim@seoul-dev.kr",
    plan: "pro",
    track: "Zero Knowledge Proofs & Cryptography",
    progress: 89,
    aiLabScore: 96,
    labsCompleted: 26,
    country: "South Korea",
    lastActive: "1 hour ago",
    joinedDate: "Jan 03, 2026",
    status: "active",
  },
]

export const AdminStudentsPage = () => {
  const [students] = useState<StudentRecord[]>(INITIAL_STUDENTS)
  const [searchQuery, setSearchQuery] = useState("")
  const [planFilter, setPlanFilter] = useState<"all" | "cohort" | "pro" | "free">("all")
  const [trackFilter, setTrackFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"progress" | "score" | "name">("progress")
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  // Count helper
  const counts = useMemo(
    () => ({
      all: students.length,
      cohort: students.filter((s) => s.plan === "cohort").length,
      pro: students.filter((s) => s.plan === "pro").length,
      free: students.filter((s) => s.plan === "free").length,
    }),
    [students]
  )

  // Filter & Sort Logic
  const filteredStudents = useMemo(() => {
    return students
      .filter((student) => {
        const matchesSearch =
          student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.track.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.country.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesPlan = planFilter === "all" || student.plan === planFilter
        const matchesTrack = trackFilter === "all" || student.track.includes(trackFilter)

        return matchesSearch && matchesPlan && matchesTrack
      })
      .sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name)
        if (sortBy === "progress") return b.progress - a.progress
        if (sortBy === "score") return b.aiLabScore - a.aiLabScore
        return 0
      })
  }, [students, searchQuery, planFilter, trackFilter, sortBy])

  // Paginated Slice
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredStudents.slice(start, start + pageSize)
  }, [filteredStudents, currentPage, pageSize])

  const handleResetFilters = () => {
    setSearchQuery("")
    setPlanFilter("all")
    setTrackFilter("all")
    setSortBy("progress")
    setCurrentPage(1)
  }

  const hasActiveFilters =
    Boolean(searchQuery) || planFilter !== "all" || trackFilter !== "all" || sortBy !== "progress"

  // Calculated Stats
  const avgProgress = useMemo(() => {
    if (students.length === 0) return 0
    const total = students.reduce((acc, s) => acc + s.progress, 0)
    return Math.round(total / students.length)
  }, [students])

  const totalLabs = useMemo(() => {
    return students.reduce((acc, s) => acc + s.labsCompleted, 0)
  }, [students])

  // Metrics
  const metrics: TableMetricCard[] = [
    { label: "Total Students", val: counts.all, icon: Users, color: "text-[#F42A18]" },
    {
      label: "Cohort & Pro Learners",
      val: counts.cohort + counts.pro,
      icon: Sparkles,
      color: "text-purple-500",
    },
    {
      label: "AI Labs Executed",
      val: `${totalLabs} Projects`,
      icon: Award,
      color: "text-blue-500",
    },
    {
      label: "Avg Track Completion",
      val: `${avgProgress}%`,
      icon: BookOpen,
      color: "text-emerald-500",
    },
  ]

  // Columns Configuration
  const columns: TableColumn<StudentRecord>[] = [
    {
      header: "Student",
      cell: (student) => {
        const initials = student.name
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
                {student.name}
              </div>
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                {student.email}
              </div>
            </div>
          </div>
        )
      },
    },
    {
      header: "Plan",
      cell: (student) => (
        <div className="whitespace-nowrap">
          {student.plan === "cohort" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F42A18]/10 text-[#F42A18] border border-[#F42A18]/20">
              <Sparkles className="w-3 h-3" />
              Live Cohort
            </span>
          )}
          {student.plan === "pro" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-500 border border-purple-500/20">
              <Zap className="w-3 h-3" />
              Pro Tier
            </span>
          )}
          {student.plan === "free" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
              Free Tier
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Enrolled Track",
      className: "max-w-xs",
      cell: (student) => (
        <div>
          <div className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">
            {student.track}
          </div>
          <div className="text-[11px] text-neutral-500 truncate">
            Last active: {student.lastActive}
          </div>
        </div>
      ),
    },
    {
      header: "Track Progress",
      className: "min-w-[140px]",
      cell: (student) => (
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
            <span>{student.progress}%</span>
            <span className="text-neutral-400">{student.labsCompleted} labs</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#F42A18] to-amber-500"
              style={{ width: `${student.progress}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      header: "AI Lab Score",
      align: "center",
      cell: (student) => (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20">
          {student.aiLabScore}/100
        </span>
      ),
    },
    {
      header: "Location",
      align: "center",
      cell: (student) => (
        <div className="inline-flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
          <Globe className="w-3 h-3 opacity-60" />
          <span>{student.country}</span>
        </div>
      ),
    },
    {
      header: "Actions",
      align: "right",
      cell: (student) => (
        <div className="flex items-center justify-end whitespace-nowrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedStudent(student)}
            className="h-8 px-2.5 text-xs rounded-lg border-neutral-200 dark:border-neutral-800 hover:border-[#F42A18] hover:text-[#F42A18]"
          >
            Details
          </Button>
        </div>
      ),
    },
  ]

  // Details Modal
  const modalContent = selectedStudent && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F42A18]/10 text-[#F42A18] font-bold text-base flex items-center justify-center">
              {selectedStudent.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                {selectedStudent.name}
              </h3>
              <p className="text-xs text-neutral-500">{selectedStudent.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSelectedStudent(null)}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Student Stats */}
        <div className="space-y-3 py-1 text-xs">
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200/80 dark:border-neutral-800 space-y-1.5">
            <div className="text-[11px] uppercase font-semibold text-neutral-400">
              Enrolled Engineering Track
            </div>
            <div className="font-semibold text-neutral-900 dark:text-white text-sm">
              {selectedStudent.track}
            </div>
            <div className="flex items-center justify-between text-neutral-500 pt-1">
              <span>Track Progress:</span>
              <span className="font-bold text-[#F42A18]">{selectedStudent.progress}%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800">
              <div className="text-neutral-500 text-[10px] uppercase font-semibold">
                Labs Completed
              </div>
              <div className="text-base font-bold text-neutral-900 dark:text-white">
                {selectedStudent.labsCompleted} Projects
              </div>
            </div>
            <div className="p-2.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800">
              <div className="text-neutral-500 text-[10px] uppercase font-semibold">
                AI Eval Score
              </div>
              <div className="text-base font-bold text-emerald-500">
                {selectedStudent.aiLabScore} / 100
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs py-1 border-t border-neutral-200 dark:border-neutral-800">
            <span className="text-neutral-500">Subscription Tier:</span>
            <span className="font-bold uppercase tracking-wider text-xs text-neutral-900 dark:text-white">
              {selectedStudent.plan} Tier
            </span>
          </div>

          <div className="flex items-center justify-between text-xs py-1 border-t border-neutral-200 dark:border-neutral-800">
            <span className="text-neutral-500">Country of Residence:</span>
            <span className="font-medium text-neutral-800 dark:text-neutral-200">
              {selectedStudent.country}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs py-1 border-t border-neutral-200 dark:border-neutral-800">
            <span className="text-neutral-500">Member Since:</span>
            <span className="font-medium text-neutral-800 dark:text-neutral-200">
              {selectedStudent.joinedDate}
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
          <Button
            type="button"
            variant="outline"
            onClick={() => setSelectedStudent(null)}
            className="text-xs rounded-xl border-neutral-200 dark:border-neutral-800"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <DataTableTemplate<StudentRecord>
      badge={{
        icon: ShieldCheck,
        label: "Learner Analytics & Directory",
      }}
      title="Student Management"
      description="View active learners, track AI lab completion progress, and oversee student engagement across all cohorts."
      headerActions={
        <span className="px-3.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 text-xs font-semibold border border-emerald-500/20 flex items-center gap-1.5">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>{counts.all} Enrolled Learners</span>
        </span>
      }
      metrics={metrics}
      searchPlaceholder="Search by student name, email, track, or country..."
      searchQuery={searchQuery}
      onSearchChange={(q) => {
        setSearchQuery(q)
        setCurrentPage(1)
      }}
      tabs={[
        { key: "all", label: "All", count: counts.all },
        { key: "cohort", label: "Cohort", count: counts.cohort },
        { key: "pro", label: "Pro", count: counts.pro },
        { key: "free", label: "Free", count: counts.free },
      ]}
      activeTab={planFilter}
      onTabChange={(k) => {
        setPlanFilter(k as any)
        setCurrentPage(1)
      }}
      dropdownFilters={[
        {
          key: "track",
          value: trackFilter,
          onChange: (val) => {
            setTrackFilter(val)
            setCurrentPage(1)
          },
          options: [
            { label: "All Tracks", value: "all" },
            { label: "Distributed Systems", value: "Distributed Systems" },
            { label: "AI & Autonomous", value: "AI & Autonomous" },
            { label: "Rust Microservices", value: "Rust" },
            { label: "Kubernetes & eBPF", value: "Kubernetes" },
            { label: "Cryptography", value: "Cryptography" },
          ],
        },
      ]}
      sortOptions={[
        { label: "Sort: Track Progress", value: "progress" },
        { label: "Sort: Highest AI Score", value: "score" },
        { label: "Sort: Name (A-Z)", value: "name" },
      ]}
      currentSort={sortBy}
      onSortChange={(val) => setSortBy(val as any)}
      hasActiveFilters={hasActiveFilters}
      onResetFilters={handleResetFilters}
      columns={columns}
      data={paginatedStudents}
      keyExtractor={(s) => s.id}
      pagination={{
        currentPage,
        pageSize,
        totalItems: filteredStudents.length,
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

export default AdminStudentsPage
