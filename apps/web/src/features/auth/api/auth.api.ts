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
      body: JSON.stringify(data),
    })
  },

  register: async (data: SignupDTO): Promise<AuthResponse> => {
    return apiClient<AuthResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  logout: async (): Promise<AuthResponse> => {
    return apiClient<AuthResponse>("/auth/logout", {
      method: "POST",
    })
  },

  verifyOtp: async (data: VerifyOtpDTO): Promise<AuthResponse> => {
    return apiClient<AuthResponse>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  resendOtp: async (data: ResendOtpDTO): Promise<AuthResponse> => {
    return apiClient<AuthResponse>("/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  forgotPassword: async (data: ForgotPasswordDTO): Promise<AuthResponse> => {
    return apiClient<AuthResponse>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  resetPassword: async (data: ResetPasswordDTO): Promise<AuthResponse> => {
    return apiClient<AuthResponse>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient<{ data?: { user: User }; user?: User }>("/users/me", {
      method: "GET",
    })
    return response.data?.user || response.user || (response as unknown as User)
  },
}

export default authApi
