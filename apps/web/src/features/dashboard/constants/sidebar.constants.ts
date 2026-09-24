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
  Tag,
  Building2,
  Wallet,
  ArrowUpRight,
  Compass,
  Heart,
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
    label: "Learning Hub",
    items: [
      {
        title: "Dashboard",
        url: "/students/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Explore Courses",
        url: "/courses",
        icon: Compass,
      },
      {
        title: "My Wishlist",
        url: "/wishlist",
        icon: Heart,
      },
    ],
  },
  {
    label: "Finance & Billing",
    items: [
      {
        title: "My Wallet",
        url: "/students/wallet",
        icon: Wallet,
      },
      {
        title: "Bank Accounts",
        url: "/students/bank-details",
        icon: Building2,
      },
    ],
  },
  {
    label: "Account & Security",
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
    label: "Studio & Content",
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
        title: "Community & Cohorts",
        url: "/community",
        icon: Users,
      },
    ],
  },
  {
    label: "Finance & Monetization",
    items: [
      {
        title: "Wallet & Payouts",
        url: "/teachers/wallet",
        icon: Wallet,
      },
      {
        title: "Bank & Settlement",
        url: "/teachers/bank-details",
        icon: Building2,
      },
      {
        title: "Plans & Subscription",
        url: "/teachers/plans",
        icon: Zap,
      },
    ],
  },
  {
    label: "Account & Security",
    items: [
      {
        title: "Teacher Profile",
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
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        url: "/admin/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "User Management",
    items: [
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
    ],
  },
  {
    label: "Courses & Academics",
    items: [
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
    ],
  },
  {
    label: "Finance & Treasury",
    items: [
      {
        title: "Platform Wallets",
        url: "/admin/wallets",
        icon: Wallet,
      },
      {
        title: "Payout Requests",
        url: "/admin/payouts",
        icon: ArrowUpRight,
      },
      {
        title: "Bank Accounts",
        url: "/admin/bank-details",
        icon: Building2,
      },
      {
        title: "Plans & Tiers",
        url: "/admin/plans",
        icon: Layers,
      },
      {
        title: "Subscriptions",
        url: "/admin/subscriptions",
        icon: CreditCard,
      },
      {
        title: "Offers & Promos",
        url: "/admin/offers",
        icon: Tag,
      },
    ],
  },
  {
    label: "AI & Intelligence",
    items: [
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
        title: "Admin Profile",
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



