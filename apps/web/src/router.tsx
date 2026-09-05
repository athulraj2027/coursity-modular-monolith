import { Routes, Route, Navigate } from "react-router-dom"
import { MainLayout } from "@/components/layout/MainLayout"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { HomePage } from "@/features/home"
import { TeachersPage } from "@/features/teachers"
import {
  StudentDashboardPage,
  TeacherDashboardPage,
  StudentProfilePage,
  TeacherProfilePage,
  AdminDashboardPage,
  AdminTeachersPage,
  AdminStudentsPage,
} from "@/features/dashboard"
import {
  SigninPage,
  SignupPage,
  VerifyOtpPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  ProtectedRoute,
  RoleGuard,
  GuestGuard,
  PublicRouteGuard,
} from "@/features/auth"
import { NotFoundPage, UnauthorizedPage } from "@/pages"

export function AppRoutes() {
  return (
    <Routes>
      {/* 1. Public Pages (Accessible to Guests & Students, strictly guarded from Teachers & Admins) */}
      <Route element={<PublicRouteGuard />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/teachers" element={<TeachersPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* 2. Guest-Only Auth Routes (Redirects to active dashboard if already logged in) */}
          <Route element={<GuestGuard />}>
            {/* Student Auth Routes */}
            <Route path="/signin" element={<SigninPage role="student" />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/verify-otp" element={<VerifyOtpPage role="student" />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage role="student" />} />
            <Route path="/reset-password" element={<ResetPasswordPage role="student" />} />

            {/* Teacher Auth Routes */}
            <Route path="/teachers/signin" element={<SigninPage role="teacher" />} />
            <Route path="/teachers/signup" element={<SignupPage />} />
            <Route path="/teachers/verify-otp" element={<VerifyOtpPage role="teacher" />} />
            <Route path="/teachers/forgot-password" element={<ForgotPasswordPage role="teacher" />} />
            <Route path="/teachers/reset-password" element={<ResetPasswordPage role="teacher" />} />

            {/* Admin Signin Routes */}
            <Route path="/admin/signin" element={<SigninPage role="admin" />} />
          </Route>
        </Route>
      </Route>

      {/* 3. Protected Student Portal Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleGuard allowedRoles={["student"]} />}>
          <Route path="/students/dashboard" element={<DashboardLayout role="student" />}>
            <Route index element={<StudentDashboardPage />} />
          </Route>
          <Route path="/students/profile" element={<DashboardLayout role="student" />}>
            <Route index element={<StudentProfilePage />} />
          </Route>
          {/* Aliases for student dashboard & profile */}
          <Route path="/student/dashboard" element={<Navigate to="/students/dashboard" replace />} />
          <Route path="/dashboard" element={<Navigate to="/students/dashboard" replace />} />
          <Route path="/profile" element={<Navigate to="/students/profile" replace />} />
          <Route path="/student/profile" element={<Navigate to="/students/profile" replace />} />
        </Route>
      </Route>

      {/* 4. Protected Teacher Portal Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleGuard allowedRoles={["teacher"]} />}>
          <Route path="/teachers/dashboard" element={<DashboardLayout role="teacher" />}>
            <Route index element={<TeacherDashboardPage />} />
          </Route>
          <Route path="/teachers/profile" element={<DashboardLayout role="teacher" />}>
            <Route index element={<TeacherProfilePage />} />
          </Route>
          {/* Aliases for teacher */}
          <Route path="/teacher/dashboard" element={<Navigate to="/teachers/dashboard" replace />} />
          <Route path="/teacher/profile" element={<Navigate to="/teachers/profile" replace />} />
        </Route>
      </Route>


      {/* 5. Protected Admin Portal Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleGuard allowedRoles={["admin"]} />}>
          <Route path="/admin/dashboard" element={<DashboardLayout role="admin" />}>
            <Route index element={<AdminDashboardPage />} />
          </Route>
          <Route path="/admin/teachers" element={<DashboardLayout role="admin" />}>
            <Route index element={<AdminTeachersPage />} />
          </Route>
          <Route path="/admin/users" element={<DashboardLayout role="admin" />}>
            <Route index element={<AdminStudentsPage />} />
          </Route>
          <Route path="/admin/students" element={<Navigate to="/admin/users" replace />} />
        </Route>
      </Route>

      {/* 6. Fallback 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRoutes
