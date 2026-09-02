export type UserRole = "student" | "teacher" | "admin"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  isEmailVerified?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data?: {
    user?: User
    token?: string
    accessToken?: string
    refreshToken?: string
  }
}

export interface SignupDTO {
  name: string
  email: string
  password: string
  confirmPassword?: string
  role?: UserRole
}

export interface SigninDTO {
  email: string
  password: string
  role?: UserRole
}

export interface VerifyOtpDTO {
  email: string
  otp: string
  role?: UserRole
}

export interface ResendOtpDTO {
  email: string
  role?: UserRole
}

export interface ForgotPasswordDTO {
  email: string
  role?: UserRole
}

export interface ResetPasswordDTO {
  email: string
  otp: string
  newPassword: string
  confirmPassword?: string
  role?: UserRole
}

export type AuthFormErrors<T> = Partial<Record<keyof T, string>>
