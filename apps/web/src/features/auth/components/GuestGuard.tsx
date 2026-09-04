import React from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useCurrentUser } from "../hooks"
import { Loader2 } from "lucide-react"

export interface GuestGuardProps {
  children?: React.ReactNode
}

export function GuestGuard({ children }: GuestGuardProps = {}) {
  const { data: user, isLoading } = useCurrentUser()
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
            Loading...
          </p>
        </div>
      </div>
    )
  }

  // If already authenticated, redirect to role-specific dashboard or previous location
  if (user) {
    const fromLocation = (location.state as { from?: { pathname?: string } })?.from?.pathname

    if (fromLocation && !fromLocation.includes("/signin") && !fromLocation.includes("/signup")) {
      return <Navigate to={fromLocation} replace />
    }

    const role = user.role?.toLowerCase()
    let destination = "/"

    if (role === "admin") {
      destination = "/admin/dashboard"
    } else if (role === "teacher") {
      destination = "/teachers/dashboard"
    }

    return <Navigate to={destination} replace />
  }

  return children ? <>{children}</> : <Outlet />
}

export default GuestGuard
