import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "@/context/theme-context"
import { MainLayout } from "@/components/layout/MainLayout"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { HomePage } from "@/pages/Home"
import { SigninPage } from "@/pages/Signin"
import { SignupPage } from "@/pages/Signup"
import { VerifyOtpPage } from "@/pages/VerifyOtp"
import { ForgotPasswordPage } from "@/pages/ForgotPassword"
import { ResetPasswordPage } from "@/pages/ResetPassword"
import { StudentDashboardPage } from "@/pages/StudentDashboard"
import { TeacherDashboardPage } from "@/pages/TeacherDashboard"
import { AdminDashboardPage } from "@/pages/AdminDashboard"
import { TeachersPage } from "@/pages/Teachers"
import { NotFoundPage } from "@/pages/NotFound"

export function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <BrowserRouter>
        <Routes>
          {/* Public Pages Layout (with Public Navbar) */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/teachers" element={<TeachersPage />} />

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
            <Route path="/admin/login" element={<SigninPage role="admin" />} />
          </Route>

          {/* 1. Student Portal Prefix Layout (/students/*) */}
          <Route path="/students/dashboard" element={<DashboardLayout role="student" />}>
            <Route index element={<StudentDashboardPage />} />
          </Route>
          {/* Default /dashboard redirect or alias */}
          <Route path="/dashboard" element={<Navigate to="/students/dashboard" replace />} />

          {/* 2. Teacher Portal Prefix Layout (/teachers/* and /teacher/*) */}
          <Route path="/teachers/dashboard" element={<DashboardLayout role="teacher" />}>
            <Route index element={<TeacherDashboardPage />} />
          </Route>

          {/* 3. Admin Portal Prefix Layout (/admin/*) */}
          <Route path="/admin/dashboard" element={<DashboardLayout role="admin" />}>
            <Route index element={<AdminDashboardPage />} />
          </Route>

          {/* Fallback 404 with Public Navbar */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
