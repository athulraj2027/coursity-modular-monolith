import {
  GraduationCap,
  LayoutDashboard,
  Settings,
  User,
  UserCheck,
  Users,
  Zap,
  Layers,
  Cpu,
  Bot,
  KeyRound,
  FolderTree,
  CreditCard,
  type LucideIcon,
} from "lucide-react"

export interface SidebarNavItem {
  title: string
  url: string
  icon: LucideIcon
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
        title: "AI Interviews",
        url: "/students/interviews",
        icon: Bot,
        badge: "AI",
      },
    ],
  },
  {
    label: "Account & Preferences",
    items: [
      {
        title: "Profile",
        url: "/students/profile",
        icon: User,
      },
      {
        title: "Password & Security",
        url: "/students/password",
        icon: KeyRound,
      },
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
    label: "Coursity Studio",
    items: [
      {
        title: "Dashboard",
        url: "/teachers/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Courses & Studio",
        url: "/teachers/courses",
        icon: GraduationCap,
      },
      {
        title: "Plans & Billing",
        url: "/teachers/plans",
        icon: Zap,
      },
    ],
  },
  {
    label: "Platform & Account",
    items: [
      {
        title: "Community & Cohorts",
        url: "/community",
        icon: Users,
      },
      {
        title: "Profile",
        url: "/teachers/profile",
        icon: User,
      },
      {
        title: "Password & Security",
        url: "/teachers/password",
        icon: KeyRound,
      },
      {
        title: "Settings",
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
      {
        title: "Categories",
        url: "/admin/categories",
        icon: FolderTree,
      },
      {
        title: "Plans",
        url: "/admin/plans",
        icon: Layers,
      },
      {
        title: "Subscriptions",
        url: "/admin/subscriptions",
        icon: CreditCard,
      },
      {
        title: "AI Interviews",
        url: "/admin/interviews",
        icon: Bot,
        badge: "AI",
      },
      {
        title: "AI & Models Config",
        url: "/admin/ai-config",
        icon: Cpu,
        badge: "v1",
      },
    ],
  },
  {
    label: "Account & System",
    items: [
      {
        title: "Administrator Profile",
        url: "/admin/profile",
        icon: User,
      },
      {
        title: "Password & Security",
        url: "/admin/password",
        icon: KeyRound,
      },
    ],
  },
]

