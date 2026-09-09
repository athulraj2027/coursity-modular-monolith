import { apiClient } from "@/lib/api-client"
import { AUTH_API_ROUTES } from "../constants/routes.constants"
import type {
  AuthResponse,
  ForgotPasswordDTO,
  ResetPasswordDTO,
  SigninDTO,
  SignupDTO,
  User,
  GoogleAuthDTO,
  VerifyOtpDTO,
  ResendOtpDTO,
} from "../types"

export const authApi = {
  login: async (data: SigninDTO): Promise<AuthResponse> => {
    return apiClient<AuthResponse>(AUTH_API_ROUTES.SIGNIN, {
      method: "POST",
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        role: data.role
          ? data.role === "teacher"
            ? "TEACHER"
            : data.role === "admin"
              ? "ADMIN"
              : "STUDENT"
          : undefined,
      }),
    })
  },

  register: async (data: SignupDTO): Promise<AuthResponse> => {
    return apiClient<AuthResponse>(AUTH_API_ROUTES.SIGNUP, {
      method: "POST",
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role === "teacher" ? "TEACHER" : "STUDENT",
      }),
    })
  },

  googleAuth: async (data: GoogleAuthDTO): Promise<AuthResponse> => {
    return apiClient<AuthResponse>(AUTH_API_ROUTES.GOOGLE, {
      method: "POST",
      body: JSON.stringify({
        idToken: data.idToken,
        credential: data.credential,
        code: data.code,
        role: data.role || "STUDENT",
      }),
    })
  },

  getGoogleAuthUrl: async (role?: string): Promise<{ url: string }> => {
    const params = new URLSearchParams()
    if (role) {
      params.set("state", JSON.stringify({ role: role.toUpperCase() }))
    }
    const endpoint = `${AUTH_API_ROUTES.GOOGLE}${params.toString() ? `?${params.toString()}` : ""}`
    const response = await apiClient<{ message: string; data: { url: string } }>(endpoint, {
      method: "GET",
    })
    return response.data
  },

  logout: async (): Promise<AuthResponse> => {
    const userStr =
      typeof window !== "undefined" ? localStorage.getItem("user") : null
    let userId: string | undefined = undefined
    try {
      if (userStr) {
        const user = JSON.parse(userStr)
        userId = user?.id
      }
    } catch {
      // ignore
    }

    const response = await apiClient<AuthResponse>(AUTH_API_ROUTES.LOGOUT, {
      method: "POST",
      body: JSON.stringify({ userId }),
    })

    if (typeof window !== "undefined") {
      localStorage.removeItem("user")
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
    }

    return response
  },

  verifyOtp: async (data: VerifyOtpDTO): Promise<AuthResponse> => {
    return apiClient<AuthResponse>(AUTH_API_ROUTES.VERIFY_OTP, {
      method: "POST",
      body: JSON.stringify({
        email: data.email,
        otp: data.otp,
      }),
    })
  },

  resendOtp: async (data: ResendOtpDTO): Promise<AuthResponse> => {
    return apiClient<AuthResponse>(AUTH_API_ROUTES.RESEND_OTP, {
      method: "POST",
      body: JSON.stringify({
        email: data.email,
      }),
    })
  },

  forgotPassword: async (data: ForgotPasswordDTO): Promise<AuthResponse> => {
    return apiClient<AuthResponse>(AUTH_API_ROUTES.FORGOT_PASSWORD, {
      method: "POST",
      body: JSON.stringify({
        email: data.email,
      }),
    })
  },

  resetPassword: async (data: ResetPasswordDTO): Promise<AuthResponse> => {
    return apiClient<AuthResponse>(AUTH_API_ROUTES.RESET_PASSWORD, {
      method: "POST",
      body: JSON.stringify({
        email: data.email,
        otp: data.otp,
        newPassword: data.newPassword,
      }),
    })
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient<{ data?: { user: User }; user?: User }>(AUTH_API_ROUTES.ME, {
      method: "GET",
    })
    return response.data?.user || response.user || (response as unknown as User)
  },

  refreshToken: async (): Promise<AuthResponse> => {
    return apiClient<AuthResponse>(AUTH_API_ROUTES.REFRESH, {
      method: "POST",
      body: JSON.stringify({}),
      skipIdempotency: true,
    })
  },
}

export default authApi
