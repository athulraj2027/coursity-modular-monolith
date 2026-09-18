import { Routes, Route, Navigate } from "react-router-dom"
import { MainLayout } from "@/components/layout/MainLayout"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { HomePage } from "@/features/home"
import { TeachersPage } from "@/features/teachers"
import {
  StudentDashboardPage,
  TeacherDashboardPage,
  AdminDashboardPage,
  AdminTeachersPage,
  AdminStudentsPage,
} from "@/features/dashboard"
import {
  StudentProfilePage,
  TeacherProfilePage,
  AdminProfilePage,
  ChangePasswordPage,
} from "@/features/profile"
import {
  TeacherPlansPage,
  AdminPlansPage,
  AdminPlanDetailsPage,
  AdminPlanFormPage,
} from "@/features/plans"
import { AdminAIConfigPage } from "@/features/ai-config"
import {
  InterviewLandingPage,
  InterviewSetupPage,
  InterviewRoomPage,
  InterviewCompletedPage,
  CandidateInterviewsPage,
  AdminInterviewsPage,
  AdminInterviewDetailPage,
} from "@/features/interview"
import {
  SigninPage,
  SignupPage,
  VerifyOtpPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  AuthCallbackPage,
  ProtectedRoute,
  RoleGuard,
  GuestGuard,
  PublicRouteGuard,
  useCurrentUser,
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
          <Route path="/auth/callback" element={<AuthCallbackPage />} />

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
          <Route path="/students/password" element={<DashboardLayout role="student" />}>
            <Route index element={<ChangePasswordPage role="student" />} />
          </Route>
          <Route path="/students/interviews" element={<DashboardLayout role="student" />}>
            <Route index element={<CandidateInterviewsPage />} />
          </Route>
          {/* Aliases for student dashboard & profile */}
          <Route path="/student/dashboard" element={<Navigate to="/students/dashboard" replace />} />
          <Route path="/dashboard" element={<Navigate to="/students/dashboard" replace />} />
          <Route path="/profile" element={<Navigate to="/students/profile" replace />} />
          <Route path="/student/profile" element={<Navigate to="/students/profile" replace />} />
          <Route path="/students/profile/password" element={<Navigate to="/students/password" replace />} />
          <Route path="/student/password" element={<Navigate to="/students/password" replace />} />
          <Route path="/password" element={<Navigate to="/students/password" replace />} />
          <Route path="/students/my-interviews" element={<Navigate to="/students/interviews" replace />} />
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
          <Route path="/teachers/password" element={<DashboardLayout role="teacher" />}>
            <Route index element={<ChangePasswordPage role="teacher" />} />
          </Route>
          <Route path="/teachers/plans" element={<DashboardLayout role="teacher" />}>
            <Route index element={<TeacherPlansPage />} />
          </Route>
          <Route path="/teachers/interviews" element={<DashboardLayout role="teacher" />}>
            <Route index element={<CandidateInterviewsPage />} />
            <Route path=":sessionId" element={<InterviewCompletedPage />} />
          </Route>
          {/* Aliases for teacher */}
          <Route path="/teacher/dashboard" element={<Navigate to="/teachers/dashboard" replace />} />
          <Route path="/teacher/profile" element={<Navigate to="/teachers/profile" replace />} />
          <Route path="/teachers/profile/password" element={<Navigate to="/teachers/password" replace />} />
          <Route path="/teacher/password" element={<Navigate to="/teachers/password" replace />} />
          <Route path="/teacher/plans" element={<Navigate to="/teachers/plans" replace />} />
          <Route path="/teachers/billing" element={<Navigate to="/teachers/plans" replace />} />
          <Route path="/teachers/my-interviews" element={<Navigate to="/teachers/interviews" replace />} />
          <Route path="/teacher/interviews" element={<Navigate to="/teachers/interviews" replace />} />
        </Route>
      </Route>


      {/* 5. Protected Admin Portal Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleGuard allowedRoles={["admin"]} />}>
          <Route path="/admin/dashboard" element={<DashboardLayout role="admin" />}>
            <Route index element={<AdminDashboardPage />} />
          </Route>
          <Route path="/admin/profile" element={<DashboardLayout role="admin" />}>
            <Route index element={<AdminProfilePage />} />
          </Route>
          <Route path="/admin/password" element={<DashboardLayout role="admin" />}>
            <Route index element={<ChangePasswordPage role="admin" />} />
          </Route>
          <Route path="/admin/teachers" element={<DashboardLayout role="admin" />}>
            <Route index element={<AdminTeachersPage />} />
          </Route>
          <Route path="/admin/users" element={<DashboardLayout role="admin" />}>
            <Route index element={<AdminStudentsPage />} />
          </Route>
          <Route path="/admin/plans" element={<DashboardLayout role="admin" />}>
            <Route index element={<AdminPlansPage />} />
            <Route path="new" element={<AdminPlanFormPage />} />
            <Route path=":id" element={<AdminPlanDetailsPage />} />
            <Route path=":id/edit" element={<AdminPlanFormPage />} />
          </Route>
          <Route path="/admin/ai-config" element={<DashboardLayout role="admin" />}>
            <Route index element={<AdminAIConfigPage />} />
          </Route>
          <Route path="/admin/interviews" element={<DashboardLayout role="admin" />}>
            <Route index element={<AdminInterviewsPage />} />
            <Route path=":id" element={<AdminInterviewDetailPage />} />
          </Route>
          <Route path="/admin/profile/password" element={<Navigate to="/admin/password" replace />} />
          <Route path="/admin/students" element={<Navigate to="/admin/users" replace />} />
        </Route>
      </Route>

      {/* 6. Candidate Real-Time AI Interview Studio Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/interview/:sessionId" element={<InterviewLandingPage />} />
        <Route path="/interview/:sessionId/setup" element={<InterviewSetupPage />} />
        <Route path="/interview/:sessionId/room" element={<InterviewRoomPage />} />
        <Route path="/interview/:sessionId/completed" element={<CandidateDossierWrapper />} />
        <Route path="/interviews/my-interviews" element={<RoleBasedInterviewRedirect />} />
        <Route path="/interviews" element={<RoleBasedInterviewRedirect />} />
      </Route>

      {/* 7. Fallback 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

function CandidateDossierWrapper() {
  const { data: user } = useCurrentUser();
  const role =
    user?.role === "ADMIN" || user?.role === "admin"
      ? "admin"
      : user?.role === "TEACHER" || user?.role === "teacher"
      ? "teacher"
      : "student";

  return (
    <DashboardLayout role={role}>
      <InterviewCompletedPage />
    </DashboardLayout>
  );
}

function RoleBasedInterviewRedirect() {
  const { data: user } = useCurrentUser();
  if (user?.role === "TEACHER" || user?.role === "teacher") {
    return <Navigate to="/teachers/interviews" replace />;
  }
  if (user?.role === "ADMIN" || user?.role === "admin") {
    return <Navigate to="/admin/interviews" replace />;
  }
  return <Navigate to="/students/interviews" replace />;
}

export default AppRoutes
