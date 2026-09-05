import { env } from "./env"

const API_BASE_URL = env.VITE_API_URL

export class ApiError extends Error {
  public status: number
  public data: any

  constructor(message: string, status: number, data?: any) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.data = data
  }
}

export interface ApiClientOptions extends RequestInit {
  /**
   * Optional custom idempotency key to prevent duplicate requests.
   * If not provided for mutating methods (POST, PUT, PATCH, DELETE),
   * a unique UUID will be automatically generated.
   */
  idempotencyKey?: string
  /**
   * Set to true to disable automatic Idempotency-Key generation on mutations.
   */
  skipIdempotency?: boolean
  /**
   * Internal flag to avoid infinite refresh retry loops.
   */
  _retry?: boolean
}

/**
 * Generates a unique UUID v4 for request idempotency.
 */
export function generateIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Single active refresh promise to deduplicate concurrent 401 refresh requests
let activeRefreshPromise: Promise<boolean> | null = null

/**
 * Attempts to refresh the session via the backend /auth/refresh endpoint using HTTP-only cookies.
 * Deduplicates concurrent calls so only one refresh network request occurs.
 */
export async function refreshAccessToken(): Promise<boolean> {
  if (activeRefreshPromise) {
    return activeRefreshPromise
  }

  activeRefreshPromise = (async () => {
    try {
      const refreshUrl = `${API_BASE_URL}/auth/refresh`
      const response = await fetch(refreshUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}), // Backend automatically reads req.cookies.refreshToken
        credentials: "include",   // Transmits refreshToken cookie and receives new Set-Cookie headers
      })

      return response.ok
    } catch {
      return false
    } finally {
      activeRefreshPromise = null
    }
  })()

  return activeRefreshPromise
}

// Routes where 401 should NOT trigger a token refresh
const AUTH_ENDPOINTS = [
  "/auth/signin",
  "/auth/signup",
  "/auth/refresh",
  "/auth/logout",
  "/auth/verify-otp",
  "/auth/resend-otp",
  "/auth/forgot-password",
  "/auth/reset-password",
]

export async function apiClient<T>(
  endpoint: string,
  options: ApiClientOptions = {}
): Promise<T> {
  const { idempotencyKey, skipIdempotency, _retry, headers: rawHeaders, ...fetchOptions } = options
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`

  const headers = new Headers(rawHeaders || {})
  if (!headers.has("Content-Type") && !(fetchOptions.body instanceof FormData)) {
    headers.set("Content-Type", "application/json")
  }

  // Inject Idempotency-Key for mutating requests (POST, PUT, PATCH, DELETE)
  const method = (fetchOptions.method || "GET").toUpperCase()
  const isMutating = ["POST", "PUT", "PATCH", "DELETE"].includes(method)

  if (isMutating && !skipIdempotency) {
    if (idempotencyKey) {
      headers.set("Idempotency-Key", idempotencyKey)
    } else if (!headers.has("Idempotency-Key") && !headers.has("x-idempotency-key")) {
      headers.set("Idempotency-Key", generateIdempotencyKey())
    }
  }

  let response: Response
  try {
    response = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: "include", // For session / httpOnly cookies
    })
  } catch (networkErr: any) {
    throw new ApiError(
      "Unable to connect to the server. Please ensure the backend is running.",
      0,
      networkErr
    )
  }

  // Check for 401 Unauthorized to trigger automatic cookie token refresh and retry
  const isAuthEndpoint = AUTH_ENDPOINTS.some((authPath) => endpoint.includes(authPath))
  if (response.status === 401 && !_retry && !isAuthEndpoint) {
    const success = await refreshAccessToken()

    if (success) {
      // Retry original request — browser automatically sends the new accessToken cookie
      return apiClient<T>(endpoint, {
        ...options,
        _retry: true,
        headers,
      })
    }
  }

  let responseData: any = null
  const contentType = response.headers.get("content-type")
  if (contentType && contentType.includes("application/json")) {
    responseData = await response.json()
  } else {
    responseData = await response.text()
  }

  if (!response.ok) {
    let errorMessage =
      responseData?.message ||
      responseData?.error ||
      `Request failed with status ${response.status}`

    // Sanitize any raw database or internal trace messages if they leak
    if (
      typeof errorMessage === "string" &&
      (errorMessage.includes("Invalid `this.prisma") ||
        errorMessage.includes("PrismaClient") ||
        errorMessage.includes("invocation in") ||
        errorMessage.includes("does not exist"))
    ) {
      errorMessage = "A server configuration error occurred. Please try again later."
    }

    throw new ApiError(errorMessage, response.status, responseData)
  }

  return responseData as T
}

export default apiClient
