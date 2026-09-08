import React, { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import { Loader2, ShieldCheck, AlertCircle } from "lucide-react"
import { authApi } from "../api/auth.api"
import { showToast } from "@/lib/toast"

export const AuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [statusMessage, setStatusMessage] = useState("Authenticating with Google...")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const processAuth = async () => {
      // 1. Check for error parameters from OAuth provider
      const errorParam = searchParams.get("error") || searchParams.get("error_description")
      if (errorParam) {
        if (!isMounted) return
        setError(errorParam)
        showToast.error(errorParam)
        setTimeout(() => navigate("/signin", { replace: true }), 2000)
        return
      }

      try {
        const code = searchParams.get("code")
        const stateParam = searchParams.get("state")
        let targetRole: "STUDENT" | "TEACHER" | "ADMIN" = "STUDENT"

        if (stateParam) {
          try {
            const parsedState = JSON.parse(stateParam)
            if (parsedState.role) targetRole = parsedState.role
          } catch {
            if (stateParam.toUpperCase() === "TEACHER" || stateParam.toUpperCase() === "ADMIN") {
              targetRole = stateParam.toUpperCase() as any
            }
          }
        }

        // If authorization code was returned directly to frontend
        if (code) {
          setStatusMessage("Exchanging authorization code...")
          await authApi.googleAuth({
            code,
            role: targetRole,
          })
        }

        // 2. Fetch authenticated user profile
        setStatusMessage("Setting up your session...")
        queryClient.clear()
        const user = await authApi.getCurrentUser()
        queryClient.setQueryData(["currentUser"], user)

        if (!isMounted) return

        const userRole = (user?.role?.toLowerCase() || targetRole.toLowerCase()) as
          | "student"
          | "teacher"
          | "admin"

        showToast.success(`Welcome back, ${user.name || "there"}!`)

        setTimeout(() => {
          if (!isMounted) return
          if (userRole === "admin") {
            navigate("/admin/dashboard", { replace: true })
          } else if (userRole === "teacher") {
            navigate("/teachers/dashboard", { replace: true })
          } else {
            navigate("/", { replace: true })
          }
        }, 600)
      } catch (err: any) {
        if (!isMounted) return
        const errorMsg = err?.message || "Failed to complete Google authentication. Please try again."
        setError(errorMsg)
        showToast.error(errorMsg)
        setTimeout(() => navigate("/signin", { replace: true }), 2500)
      }
    }

    processAuth()

    return () => {
      isMounted = false
    }
  }, [searchParams, navigate, queryClient])

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
      <div className="w-full max-w-sm p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl shadow-black/5 space-y-5">
        {error ? (
          <>
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto animate-in zoom-in-95 duration-200">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Authentication Failed</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">{error}</p>
            </div>
            <p className="text-[11px] text-neutral-400">Redirecting to sign-in...</p>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-2xl bg-[#F42A18]/10 text-[#F42A18] flex items-center justify-center mx-auto relative">
              <Loader2 className="w-7 h-7 animate-spin text-[#F42A18]" />
              <ShieldCheck className="w-3.5 h-3.5 absolute text-[#F42A18]" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Connecting Account</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">{statusMessage}</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AuthCallbackPage
