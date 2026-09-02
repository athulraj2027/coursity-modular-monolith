import React from "react"
import { Outlet, useLocation } from "react-router-dom"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { Separator } from "@/components/ui/separator"
import { Shield } from "lucide-react"

export interface DashboardLayoutProps {
  role?: "student" | "teacher" | "admin"
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  role = "student",
}) => {
  const location = useLocation()

  // Dynamic breadcrumb section name
  const portalName =
    role === "admin"
      ? "Admin Console"
      : role === "teacher"
      ? "Teacher Studio"
      : "Student Hub"

  // Derive active view name from pathname
  const pathSegments = location.pathname.split("/").filter(Boolean)
  const currentView =
    pathSegments.length > 1
      ? pathSegments[pathSegments.length - 1]
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase())
      : "Dashboard Overview"

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar role={role} />
      <SidebarInset className="bg-neutral-50/50 dark:bg-neutral-950 min-h-svh flex flex-col">
        {/* Top bar header */}
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-neutral-200/80 dark:border-neutral-900 px-4 transition-[width,height] ease-linear bg-white/60 dark:bg-neutral-950/60 backdrop-blur-md sticky top-0 z-20">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            {role === "admin" && <Shield className="w-3.5 h-3.5 text-[#F42A18]" />}
            <span>{portalName}</span>
            <span className="text-neutral-400">/</span>
            <span className="text-neutral-500 font-normal">{currentView}</span>
          </div>
        </header>

        {/* Nested Route Outlet */}
        <main className="flex-1 flex flex-col p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default DashboardLayout
