import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "@/context/theme-context"
import { MainLayout } from "@/components/layout/MainLayout"
import { HomePage } from "@/pages/Home"
import { SigninPage } from "@/pages/Signin"
import { SignupPage } from "@/pages/Signup"
import { VerifyOtpPage } from "@/pages/VerifyOtp"
import { ForgotPasswordPage } from "@/pages/ForgotPassword"
import { ResetPasswordPage } from "@/pages/ResetPassword"
import { DashboardPage } from "@/pages/Dashboard"
import { TeachersPage } from "@/pages/Teachers"
import { NotFoundPage } from "@/pages/NotFound"

export function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <BrowserRouter>
        <Routes>
          {/* Layout with Navbar for general pages */}
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
            <Route path="/admin" element={<SigninPage role="admin" />} />
            <Route path="/admin/signin" element={<SigninPage role="admin" />} />
            <Route path="/admin/login" element={<SigninPage role="admin" />} />

            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Dashboard page without Navbar */}
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
