import React from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useCurrentUser } from "../hooks"
import { Loader2 } from "lucide-react"

export interface ProtectedRouteProps {
  redirectPath?: string
  children?: React.ReactNode
}

export function ProtectedRoute({ redirectPath, children }: ProtectedRouteProps = {}) {
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
            Verifying authentication...
          </p>
        </div>
      </div>
    )
  }

  if (!user || error) {
    // Determine default sign-in target based on accessed portal
    let fallbackSignIn = "/signin"
    if (location.pathname.startsWith("/teachers") || location.pathname.startsWith("/teacher")) {
      fallbackSignIn = "/teachers/signin"
    } else if (location.pathname.startsWith("/admin")) {
      fallbackSignIn = "/admin/signin"
    }

    const targetRedirect = redirectPath || fallbackSignIn

    return <Navigate to={targetRedirect} state={{ from: location }} replace />
  }

  return children ? <>{children}</> : <Outlet />
}

export default ProtectedRoute