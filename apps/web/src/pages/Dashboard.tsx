import React from "react"
import { useSearchParams } from "react-router-dom"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Separator } from "@/components/ui/separator"

export const DashboardPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const roleParam = searchParams.get("role")
  const role = roleParam === "teacher" ? "teacher" : "student"

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar role={role} />
      <SidebarInset className="bg-neutral-50/50 dark:bg-neutral-950 min-h-svh">
        {/* Top bar header */}
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-neutral-200/80 dark:border-neutral-900 px-4 transition-[width,height] ease-linear">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            <span>{role === "teacher" ? "Teacher Studio" : "Learning Hub"}</span>
            <span className="text-neutral-400">/</span>
            <span className="text-neutral-500 font-normal">Dashboard</span>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Welcome Banner */}

        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default DashboardPage
