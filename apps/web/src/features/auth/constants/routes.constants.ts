/**
 * API route definitions for authentication feature.
 */

export const AUTH_API_ROUTES = {
  SIGNIN: "/auth/signin",
  SIGNUP: "/auth/signup",
  LOGOUT: "/auth/logout",
  VERIFY_OTP: "/auth/verify-otp",
  RESEND_OTP: "/auth/resend-otp",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
  ME: "/auth/me",
  REFRESH: "/auth/refresh",
} as const

export default AUTH_API_ROUTES
