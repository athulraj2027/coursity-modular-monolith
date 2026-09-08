/**
 * API route definitions for dashboard, users, and upload features.
 */

export const USER_API_ROUTES = {
  BASE: "/users",
  LIST: (queryString?: string): string =>
    queryString ? `/users?${queryString}` : "/users",
  BY_ID: (id: string): string => `/users/${id}`,
  BLOCK: (id: string): string => `/users/${id}/block`,
  APPROVE: (id: string): string => `/users/${id}/approve`,
} as const

export const UPLOAD_API_ROUTES = {
  PRESIGNED_URL: "/upload/presigned-url",
} as const

export const DASHBOARD_API_ROUTES = {
  USERS: USER_API_ROUTES,
  UPLOAD: UPLOAD_API_ROUTES,
} as const

export default DASHBOARD_API_ROUTES
