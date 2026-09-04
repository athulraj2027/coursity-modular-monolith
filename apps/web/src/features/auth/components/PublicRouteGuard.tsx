import React from "react"
import { Navigate, Outlet } from "react-router-dom"
import { useCurrentUser } from "../hooks"
import { Loader2 } from "lucide-react"

export interface PublicRouteGuardProps {
  children?: React.ReactNode
}

export function PublicRouteGuard({ children }: PublicRouteGuardProps = {}) {
  const { data: user, isLoading } = useCurrentUser()

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white transition-colors duration-200">
        <div className="flex flex-col items-center gap-3">
          <div className="relative flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-2 border-neutral-200 dark:border-neutral-800 animate-pulse" />
            <Loader2 className="w-6 h-6 text-[#F42A18] animate-spin absolute" />
          </div>
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 tracking-wide animate-pulse">
            Loading...
          </p>
        </div>
      </div>
    )
  }

  // Once teacher or admin logs in, they should never be able to access any public pages
  if (user) {
    const role = user.role?.toLowerCase()
    if (role === "teacher") {
      return <Navigate to="/teachers/dashboard" replace />
    }
    if (role === "admin") {
      return <Navigate to="/admin/dashboard" replace />
    }
  }

  // Students and guests are allowed to browse public pages
  return children ? <>{children}</> : <Outlet />
}

export default PublicRouteGuard
