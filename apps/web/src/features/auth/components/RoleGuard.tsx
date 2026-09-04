import React from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useCurrentUser } from "../hooks"
import type { UserRole } from "../types"
import { Loader2 } from "lucide-react"

export interface RoleGuardProps {
  allowedRoles: (UserRole | string)[]
  redirectTo?: string
  children?: React.ReactNode
}

export function RoleGuard({
  allowedRoles,
  redirectTo = "/unauthorized",
  children,
}: RoleGuardProps) {
  const { data: user, isLoading, error } = useCurrentUser()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white transition-colors duration-200">
        <div className="flex flex-col items-center gap-3">
          <div className="relative flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-2 border-neutral-200 dark:border-neutral-800 animate-pulse" />
            <Loader2 className="w-6 h-6 text-[#F42A18] animate-spin absolute" />
          </div>
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 tracking-wide animate-pulse">
            Checking permissions...
          </p>
        </div>
      </div>
    )
  }

  if (!user || error) {
    return <Navigate to="/signin" state={{ from: location }} replace />
  }

  const normalizedUserRole = user.role?.toLowerCase()
  const normalizedAllowedRoles = allowedRoles.map((r) => r.toLowerCase())

  if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
    return <Navigate to={redirectTo} replace />
  }

  return children ? <>{children}</> : <Outlet />
}

export default RoleGuard