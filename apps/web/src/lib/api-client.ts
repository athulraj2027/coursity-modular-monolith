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

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`

  const headers = new Headers(options.headers || {})
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json")
  }

  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  let response: Response
  try {
    response = await fetch(url, {
      ...options,
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
