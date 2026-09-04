import {
  BookOpen,
  Bot,
  Brain,
  CreditCard,
  Database,
  FileCode,
  GraduationCap,
  LayoutDashboard,
  Radio,
  ScreenShare,
  Server,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react"

export interface SidebarNavItem {
  title: string
  url: string
  icon: any
  badge?: string
  roles?: ("student" | "teacher" | "admin")[]
}

export interface SidebarNavGroup {
  label: string
  items: SidebarNavItem[]
}

export const STUDENT_SIDEBAR_GROUPS: SidebarNavGroup[] = [
  {
    label: "Core Learning",
    items: [
      {
        title: "Dashboard",
        url: "/students/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "My Tracks & Courses",
        url: "/courses",
        icon: BookOpen,
        badge: "3 Active",
      },
      {
        title: "Live Cohorts",
        url: "/live",
        icon: Radio,
        badge: "Live",
      },
      {
        title: "AI Lab & Grading",
        url: "/ai-lab",
        icon: Sparkles,
      },
      {
        title: "Adaptive Quizzes",
        url: "/quizzes",
        icon: Brain,
      },
    ],
  },
  {
    label: "Account & Preferences",
    items: [
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
      },
    ],
  },
]

export const TEACHER_SIDEBAR_GROUPS: SidebarNavGroup[] = [
  {
    label: "Creator Studio",
    items: [
      {
        title: "Studio Dashboard",
        url: "/teachers/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Curriculum Builder",
        url: "/studio/curriculum",
        icon: FileCode,
      },
      {
        title: "Live Cohorts Host",
        url: "/studio/live",
        icon: ScreenShare,
        badge: "Host",
      },
      {
        title: "AI Lab Evaluator",
        url: "/studio/ai-eval",
        icon: Bot,
      },
      {
        title: "Learner Analytics",
        url: "/studio/analytics",
        icon: TrendingUp,
      },
      {
        title: "Earnings & Stripe",
        url: "/studio/earnings",
        icon: CreditCard,
        badge: "85%",
      },
    ],
  },
  {
    label: "Platform",
    items: [
      {
        title: "Community & Cohorts",
        url: "/community",
        icon: Users,
      },
      {
        title: "Studio Settings",
        url: "/settings",
        icon: Settings,
      },
    ],
  },
]

export const ADMIN_SIDEBAR_GROUPS: SidebarNavGroup[] = [
  {
    label: "Administration",
    items: [
      {
        title: "Dashboard",
        url: "/admin/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Teachers",
        url: "/admin/teachers",
        icon: UserCheck,
        badge: "5 Pending",
      },
      {
        title: "Students",
        url: "/admin/users",
        icon: Users,
      },
      {
        title: "Courses",
        url: "/admin/courses",
        icon: GraduationCap,
      },
    ],
  },
  {
    label: "System & Telemetry",
    items: [
      {
        title: "System Health & Nodes",
        url: "/admin/health",
        icon: Server,
        badge: "99.98%",
      },
      {
        title: "Database & AI Clusters",
        url: "/admin/clusters",
        icon: Database,
      },
      {
        title: "Audit & Security Logs",
        url: "/admin/audit",
        icon: ShieldCheck,
      },
      {
        title: "Platform Settings",
        url: "/settings",
        icon: Settings,
      },
    ],
  },
]
