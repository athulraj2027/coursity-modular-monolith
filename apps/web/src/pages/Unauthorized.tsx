import React from "react"
import { Link, useNavigate } from "react-router-dom"
import { useCurrentUser, useLogout } from "@/features/auth"
import { Button } from "@/components/ui/button"
import { ShieldAlert, Home, LayoutDashboard, LogOut, Loader2 } from "lucide-react"

export const UnauthorizedPage: React.FC = () => {
  const { data: user } = useCurrentUser()
  const logout = useLogout()
  const navigate = useNavigate()

  const userRole = user?.role?.toLowerCase()
  let dashboardPath = "/students/dashboard"
  let dashboardLabel = "Student Hub"

  if (userRole === "admin") {
    dashboardPath = "/admin/dashboard"
    dashboardLabel = "Admin Console"
  } else if (userRole === "teacher") {
    dashboardPath = "/teachers/dashboard"
    dashboardLabel = "Teacher Studio"
  }

  const handleSignOut = async () => {
    try {
      await logout.mutateAsync()
      navigate("/signin", { replace: true })
    } catch {
      navigate("/signin", { replace: true })
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Shield Icon Badge */}
        <div className="mx-auto w-20 h-20 rounded-3xl bg-red-500/10 dark:bg-red-500/15 border border-red-500/20 flex items-center justify-center text-[#F42A18] shadow-lg shadow-red-500/5 animate-in zoom-in duration-300">
          <ShieldAlert className="w-10 h-10" />
        </div>

        {/* Heading and Description */}
        <div className="space-y-2">
          <span className="inline-block text-[11px] font-bold tracking-widest uppercase text-[#F42A18] bg-[#F42A18]/10 px-3 py-1 rounded-full border border-[#F42A18]/20">
            403 • Access Restricted
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Permission Required
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed">
            You don't have authorization to access this portal or resource with your current account privileges.
          </p>
        </div>

        {/* Signed In As Card (if logged in) */}
        {user && (
          <div className="p-3.5 rounded-2xl bg-neutral-100/80 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 text-left text-xs space-y-1">
            <div className="text-[11px] text-neutral-400 font-medium">Currently signed in as:</div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-900 dark:text-white truncate">
                {user.name} ({user.email})
              </span>
              <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F42A18]/10 text-[#F42A18] ml-2">
                {user.role}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {user ? (
            <Button
              asChild
              className="w-full sm:w-auto bg-[#F42A18] hover:bg-[#d92211] text-white shadow-md shadow-[#F42A18]/20 rounded-xl"
            >
              <Link to={dashboardPath} className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                <span>Go to {dashboardLabel}</span>
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              className="w-full sm:w-auto bg-[#F42A18] hover:bg-[#d92211] text-white shadow-md shadow-[#F42A18]/20 rounded-xl"
            >
              <Link to="/signin" className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            </Button>
          )}

          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto rounded-xl border-neutral-200 dark:border-neutral-800"
          >
            <Link to="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              <span>Return Home</span>
            </Link>
          </Button>
        </div>

        {/* Switch Account Option */}
        {user && (
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSignOut}
              disabled={logout.isPending}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-[#F42A18] dark:text-neutral-400 dark:hover:text-[#F42A18] transition-colors cursor-pointer"
            >
              {logout.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LogOut className="w-3.5 h-3.5" />
              )}
              <span>Switch account / Sign out</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default UnauthorizedPage
