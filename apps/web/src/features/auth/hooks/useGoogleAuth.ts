import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import { authApi } from "../api/auth.api"
import { loadGoogleScript } from "../lib/google-script"
import { env } from "@/lib/env"
import { showToast } from "@/lib/toast"

export interface UseGoogleAuthOptions {
  role?: "student" | "teacher" | "admin"
  onSuccess?: (user: any) => void
  onError?: (error: Error) => void
}

export function useGoogleAuth(defaultRole: "student" | "teacher" | "admin" = "student") {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const codeClientRef = useRef<any>(null)

  // Pre-load Google SDK and initialize code client on mount
  useEffect(() => {
    const clientId = env.VITE_GOOGLE_CLIENT_ID
    if (!clientId || typeof window === "undefined") return

    loadGoogleScript()
      .then(() => {
        if (window.google?.accounts?.oauth2 && !codeClientRef.current) {
          try {
            codeClientRef.current = window.google.accounts.oauth2.initCodeClient({
              client_id: clientId,
              scope: "openid email profile",
              ux_mode: "popup",
              callback: () => {}, // overridden per trigger
              error_callback: () => {},
            })
          } catch (e) {
            console.warn("[GoogleAuth] Failed to initialize GIS code client:", e)
          }
        }
      })
      .catch((err) => {
        console.warn("[GoogleAuth] Failed to pre-load Google SDK:", err)
      })
  }, [])

  const handleAuthSuccess = (response: any, targetRole: "student" | "teacher" | "admin") => {
    const successMessage = response?.message || "Signed in with Google successfully!"
    showToast.success(successMessage)

    // Invalidate and refresh current session queries
    queryClient.clear()
    queryClient.invalidateQueries({ queryKey: ["currentUser"] })

    const user = response?.data?.user || response?.user
    const userRole = (user?.role?.toLowerCase() || targetRole) as "student" | "teacher" | "admin"

    setTimeout(() => {
      setIsPending(false)
      if (userRole === "admin") {
        navigate("/admin/dashboard")
      } else if (userRole === "teacher") {
        navigate("/teachers/dashboard")
      } else {
        navigate("/")
      }
    }, 800)
  }

  const handleAuthError = (err: any) => {
    setIsPending(false)
    const errorMsg = err?.message || "Google authentication failed. Please try again."
    setError(errorMsg)
    showToast.error(errorMsg)
  }

  const fallbackRedirect = (role: "student" | "teacher" | "admin") => {
    try {
      const state = JSON.stringify({ role: role === "teacher" ? "TEACHER" : role === "admin" ? "ADMIN" : "STUDENT" })
      const redirectUrl = `${env.VITE_API_URL}/auth/google?redirect=true&state=${encodeURIComponent(state)}`
      window.location.href = redirectUrl
    } catch (err: any) {
      handleAuthError(err)
    }
  }

  const signInWithGoogle = async (roleOverride?: "student" | "teacher" | "admin") => {
    const role = roleOverride || defaultRole
    const backendRole = role === "teacher" ? "TEACHER" : role === "admin" ? "ADMIN" : "STUDENT"
    setError(null)
    setIsPending(true)

    const clientId = env.VITE_GOOGLE_CLIENT_ID

    // If client ID is present on frontend, attempt GIS Popup
    if (clientId && typeof window !== "undefined") {
      try {
        await loadGoogleScript()

        if (window.google?.accounts?.oauth2) {
          const client = window.google.accounts.oauth2.initCodeClient({
            client_id: clientId,
            scope: "openid email profile",
            ux_mode: "popup",
            callback: async (response) => {
              if (response.error) {
                handleAuthError(new Error(response.error_description || response.error))
                return
              }

              if (response.code) {
                try {
                  const res = await authApi.googleAuth({
                    code: response.code,
                    role: backendRole,
                  })
                  handleAuthSuccess(res, role)
                } catch (apiErr: any) {
                  handleAuthError(apiErr)
                }
              } else {
                setIsPending(false)
              }
            },
            error_callback: (err: any) => {
              if (err?.type === "popup_closed" || err?.message?.includes("closed")) {
                setIsPending(false)
              } else {
                handleAuthError(err)
              }
            },
          })

          client.requestCode()
          return
        }
      } catch (err) {
        console.warn("[GoogleAuth] GIS popup failed, falling back to redirect:", err)
      }
    }

    // Fallback: Redirect-based OAuth 2.0 flow
    fallbackRedirect(role)
  }

  return {
    signInWithGoogle,
    isPending,
    error,
  }
}

export default useGoogleAuth


