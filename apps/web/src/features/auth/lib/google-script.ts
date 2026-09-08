/**
 * Dynamic loader for Google Identity Services (GIS) JavaScript SDK.
 * https://accounts.google.com/gsi/client
 */

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string; select_by?: string }) => void
            auto_select?: boolean
            cancel_on_tap_outside?: boolean
            context?: string
            ux_mode?: "popup" | "redirect"
          }) => void
          prompt: (notification?: (notification: {
            isNotDisplayed: () => boolean
            isSkippedMoment: () => boolean
            isDismissedMoment: () => boolean
            getNotDisplayedReason: () => string
            getSkippedReason: () => string
            getDismissedReason: () => string
          }) => void) => void
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: "standard" | "icon"
              theme?: "outline" | "filled_blue" | "filled_black"
              size?: "large" | "medium" | "small"
              text?: "signin_with" | "signup_with" | "continue_with" | "signin"
              shape?: "rectangular" | "pill" | "circle" | "square"
              logo_alignment?: "left" | "center"
              width?: number | string
              locale?: string
            }
          ) => void
          disableAutoSelect: () => void
          revoke: (hint: string, done: (done: { successful: boolean; error: string }) => void) => void
        }
        oauth2: {
          initCodeClient: (config: {
            client_id: string
            scope: string
            ux_mode?: "popup" | "redirect"
            redirect_uri?: string
            state?: string
            callback?: (response: { code: string; error?: string; error_description?: string }) => void
            error_callback?: (error: any) => void
          }) => {
            requestCode: () => void
          }
          initTokenClient: (config: {
            client_id: string
            scope: string
            callback: (response: { access_token: string; error?: string }) => void
            error_callback?: (error: any) => void
          }) => {
            requestAccessToken: () => void
          }
        }
      }
    }
  }
}

let googleScriptPromise: Promise<void> | null = null

export function loadGoogleScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve()
  }

  if (window.google?.accounts?.id || window.google?.accounts?.oauth2) {
    return Promise.resolve()
  }

  if (googleScriptPromise) {
    return googleScriptPromise
  }

  googleScriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]')
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve())
      existingScript.addEventListener("error", (e) => reject(e))
      return
    }

    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => {
      googleScriptPromise = null
      reject(new Error("Failed to load Google Identity Services SDK"))
    }

    document.head.appendChild(script)
  })

  return googleScriptPromise
}
