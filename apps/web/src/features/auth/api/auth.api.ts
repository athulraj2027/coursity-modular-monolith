import { apiClient } from "@/lib/api-client"
import type {
  AuthResponse,
  ForgotPasswordDTO,
  ResetPasswordDTO,
  SigninDTO,
  SignupDTO,
  User,
  VerifyOtpDTO,
  ResendOtpDTO,
} from "../types"

export const authApi = {
  login: async (data: SigninDTO): Promise<AuthResponse> => {
    return apiClient<AuthResponse>("/auth/signin", {
      method: "POST",
      body: JSON.stringify({
        email: data.email,
        password: data.password,
      }),
    })
  },

  register: async (data: SignupDTO): Promise<AuthResponse> => {
    return apiClient<AuthResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role === "teacher" ? "TEACHER" : "STUDENT",
      }),
    })
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

    const response = await apiClient<AuthResponse>("/auth/logout", {
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
    return apiClient<AuthResponse>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({
        email: data.email,
        otp: data.otp,
      }),
    })
  },

  resendOtp: async (data: ResendOtpDTO): Promise<AuthResponse> => {
    return apiClient<AuthResponse>("/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify({
        email: data.email,
      }),
    })
  },

  forgotPassword: async (data: ForgotPasswordDTO): Promise<AuthResponse> => {
    return apiClient<AuthResponse>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({
        email: data.email,
      }),
    })
  },

  resetPassword: async (data: ResetPasswordDTO): Promise<AuthResponse> => {
    return apiClient<AuthResponse>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({
        email: data.email,
        otp: data.otp,
        newPassword: data.newPassword,
      }),
    })
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient<{ data?: { user: User }; user?: User }>("/auth/me", {
      method: "GET",
    })
    return response.data?.user || response.user || (response as unknown as User)
  },
}

export default authApi
