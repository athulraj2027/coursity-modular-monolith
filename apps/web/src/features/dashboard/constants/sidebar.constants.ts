import {
  Database,
  GraduationCap,
  LayoutDashboard,
  Server,
  Settings,
  ShieldCheck,
  User,
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
      }
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
      }
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
        title: "Profile",
        url: "/teachers/profile",
        icon: User,
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
