import { Link, useLocation, useNavigate } from "react-router-dom"
import { useLogout } from "@/features/auth"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  STUDENT_SIDEBAR_GROUPS,
  TEACHER_SIDEBAR_GROUPS,
  ADMIN_SIDEBAR_GROUPS,
  type SidebarNavGroup,
} from "@/features/dashboard"
import { HERO_CONTENT } from "@/features/home"
import { ThemeToggle } from "@/components/common/ThemeToggle"
import { LogOut, Sparkles, User, ChevronRight, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

export interface AppSidebarProps {
  role?: "student" | "teacher" | "admin"
  user?: {
    name?: string
    email?: string
    avatar?: string
  }
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  role = "student",
  user = {
    name:
      role === "admin"
        ? "Root Admin"
        : role === "teacher"
        ? "Ada Lovelace"
        : "Alex Turing",
    email:
      role === "admin"
        ? "admin@coursity.io"
        : role === "teacher"
        ? "ada@coursity.io"
        : "alex@example.com",
  },
}) => {
  const location = useLocation()
  const navigate = useNavigate()
  const logout = useLogout()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  const handleSignOut = async () => {
    try {
      await logout.mutateAsync()
    } catch {
      // ignore
    } finally {
      const target =
        role === "admin"
          ? "/admin/signin"
          : role === "teacher"
          ? "/teachers/signin"
          : "/signin"
      navigate(target, { replace: true })
    }
  }

  const navGroups: SidebarNavGroup[] =
    role === "admin"
      ? ADMIN_SIDEBAR_GROUPS
      : role === "teacher"
      ? TEACHER_SIDEBAR_GROUPS
      : STUDENT_SIDEBAR_GROUPS

  return (
    <Sidebar collapsible="icon" className="border-r border-neutral-200/80 dark:border-neutral-900">
      {/* 1. Header: Brand Logo & Portal Switcher */}
      <SidebarHeader className="border-b border-neutral-200/60 dark:border-neutral-900/80 px-3 py-3.5">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2.5 overflow-hidden transition-all w-full"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#F42A18] text-white shadow-md shadow-[#F42A18]/25 font-black text-sm">
              C
            </div>
            {!isCollapsed && (
              <div className="flex flex-col text-left leading-tight">
                <span className="font-bold text-sm text-neutral-900 dark:text-white tracking-tight">
                  {HERO_CONTENT.brandName}
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-[#F42A18] flex items-center gap-1">
                  {role === "admin" && <Shield className="w-2.5 h-2.5" />}
                  {role === "teacher"
                    ? "Teacher Studio"
                    : role === "admin"
                    ? "Admin Console"
                    : "Student Hub"}
                </span>
              </div>
            )}
          </Link>
        </div>
      </SidebarHeader>

      {/* 2. Content: Categorized Nav Groups */}
      <SidebarContent className="py-2">
        {navGroups.map((group, groupIdx) => (
          <SidebarGroup key={groupIdx}>
            <SidebarGroupLabel className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider px-2.5 mb-1">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive =
                    location.pathname === item.url ||
                    (item.url !== "/" &&
                      item.url !== "/admin" &&
                      item.url !== "/student" &&
                      item.url !== "/teacher" &&
                      location.pathname.startsWith(item.url))
                  const Icon = item.icon

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                        className={cn(
                          "rounded-xl font-medium transition-all px-2.5 py-2",
                          isActive
                            ? "bg-[#F42A18]/10 dark:bg-[#F42A18]/15 text-[#F42A18] font-semibold"
                            : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900/60"
                        )}
                      >
                        <Link to={item.url} className="flex items-center gap-2.5 w-full">
                          <Icon className={cn("w-4 h-4 shrink-0", isActive && "text-[#F42A18]")} />
                          <span className="text-xs truncate flex-1">{item.title}</span>
                          {item.badge && !isCollapsed && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-[#F42A18]/10 text-[#F42A18] border border-[#F42A18]/20">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {/* Upgrade / Live Mentorship Promo Banner (if expanded and student) */}
        {!isCollapsed && role === "student" && (
          <div className="p-3 mx-2 mt-auto rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-neutral-50 dark:bg-neutral-900/40 text-left space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 dark:text-white">
              <Sparkles className="w-3.5 h-3.5 text-[#F42A18]" />
              <span>AI Coding Lab</span>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Get real-time feedback & automated code execution on your projects.
            </p>
            <Link
              to="/ai-lab"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#F42A18] hover:underline"
            >
              <span>Launch Studio</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        )}
      </SidebarContent>

      {/* 3. Footer: Profile & Theme Options */}
      <SidebarFooter className="border-t border-neutral-200/60 dark:border-neutral-900/80 p-2.5">
        <div className="flex items-center justify-between gap-2">
          <Link
            to={
              role === "teacher"
                ? "/teachers/profile"
                : role === "admin"
                ? "/admin/dashboard"
                : "/students/profile"
            }
            className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-85 transition-opacity"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold text-xs">
              {user.name ? user.name.charAt(0) : <User className="w-4 h-4" />}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0 text-left leading-none">
                <span className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                  {user.name}
                </span>
                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 truncate mt-0.5">
                  {user.email}
                </span>
              </div>
            )}
          </Link>


          {!isCollapsed && (
            <div className="flex items-center gap-1 shrink-0">
              <ThemeToggle />
              <button
                type="button"
                onClick={handleSignOut}
                disabled={logout.isPending}
                title="Sign Out"
                className="p-1.5 rounded-lg text-neutral-400 hover:text-[#F42A18] hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer disabled:opacity-50"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
