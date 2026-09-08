/**
 * API route definitions for profile feature.
 */

export const PROFILE_API_ROUTES = {
  BASE: "/profile",
  STUDENT: "/profile/student",
  TEACHER: "/profile/teacher",
  SUBMIT_VERIFICATION: "/profile/teacher/submit-verification",
  SUBMIT_VERIFICATION_ALT: "/profile/submit-verification",
} as const

export default PROFILE_API_ROUTES
