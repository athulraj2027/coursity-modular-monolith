import { Routes, Route, Navigate } from "react-router-dom"
import { MainLayout } from "@/components/layout/MainLayout"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { TeacherOnboardingLayout } from "@/components/layout/TeacherOnboardingLayout"
import { HomePage } from "@/features/home"
import { TeachersPage } from "@/features/teachers"
import {
  StudentDashboardPage,
  TeacherDashboardPage,
  AdminDashboardPage,
  AdminTeachersPage,
  AdminStudentsPage,
  AdminUserDetailPage,
} from "@/features/dashboard"
import {
  StudentProfilePage,
  TeacherProfilePage,
  AdminProfilePage,
  ChangePasswordPage,
  TeacherOnboardingProfilePage,
  TeacherApplicationReviewPage,
  TeacherInterviewVettingPage,
  TeacherOnboardingBankDetailsPage,
} from "@/features/profile"
import {
  TeacherPlansPage,
  TeacherPlansBrowsePage,
  TeacherPlanCheckoutPage,
  TeacherPlanSuccessPage,
  TeacherPlanFailedPage,
  AdminPlansPage,
  AdminPlanDetailsPage,
  AdminPlanFormPage,
  AdminSubscriptionsPage,
  AdminSubscriptionDetailPage,
} from "@/features/plans"
import { AdminOffersPage } from "@/features/offers"
import { AdminCategoriesPage } from "@/features/categories"
import {
  TeacherCoursesPage,
  TeacherCourseDetailPage,
  TeacherCurriculumPage,
  AdminCoursesPage,
  AdminCourseDetailPage,
  PublicCoursesPage,
  PublicCourseDetailPage,
} from "@/features/course"
import { WishlistPage } from "@/features/wishlist"
import {
  UserBankDetailsPage,
  AdminBanksPage,
  AdminBankDetailPage,
} from "@/features/bank-details"
import {
  UserWalletPage,
  AdminWalletsPage,
  AdminPayoutsPage,
} from "@/features/wallet"
import { AdminAIConfigPage } from "@/features/ai-config"
import {
  InterviewLandingPage,
  InterviewSetupPage,
  InterviewRoomPage,
  InterviewCompletedPage,
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
  TeacherOnboardingGuard,
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
          <Route path="/courses" element={<PublicCoursesPage />} />
          <Route path="/courses/:slug" element={<PublicCourseDetailPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
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
          <Route path="/students/wallet" element={<DashboardLayout role="student" />}>
            <Route index element={<UserWalletPage />} />
          </Route>
          <Route path="/students/bank-details" element={<DashboardLayout role="student" />}>
            <Route index element={<UserBankDetailsPage />} />
          </Route>
          <Route path="/students/password" element={<DashboardLayout role="student" />}>
            <Route index element={<ChangePasswordPage role="student" />} />
          </Route>
          {/* Aliases for student dashboard & profile */}
          <Route path="/student/dashboard" element={<Navigate to="/students/dashboard" replace />} />
          <Route path="/dashboard" element={<Navigate to="/students/dashboard" replace />} />
          <Route path="/profile" element={<Navigate to="/students/profile" replace />} />
          <Route path="/student/profile" element={<Navigate to="/students/profile" replace />} />
          <Route path="/student/wallet" element={<Navigate to="/students/wallet" replace />} />
          <Route path="/students/wallets" element={<Navigate to="/students/wallet" replace />} />
          <Route path="/student/wallets" element={<Navigate to="/students/wallet" replace />} />
          <Route path="/wallet" element={<Navigate to="/students/wallet" replace />} />
          <Route path="/student/bank-details" element={<Navigate to="/students/bank-details" replace />} />
          <Route path="/students/banks" element={<Navigate to="/students/bank-details" replace />} />
          <Route path="/student/banks" element={<Navigate to="/students/bank-details" replace />} />
          <Route path="/students/profile/password" element={<Navigate to="/students/password" replace />} />
          <Route path="/student/password" element={<Navigate to="/students/password" replace />} />
          <Route path="/password" element={<Navigate to="/students/password" replace />} />
          <Route path="/students/interviews" element={<Navigate to="/students/dashboard" replace />} />
          <Route path="/students/my-interviews" element={<Navigate to="/students/dashboard" replace />} />
        </Route>
      </Route>

      {/* 4. Protected Teacher Portal & Progressive Onboarding Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleGuard allowedRoles={["teacher"]} />}>
          <Route element={<TeacherOnboardingGuard />}>
            {/* 4.1 Focused Onboarding Flow (No Sidebar, Step Stepper) */}
            <Route path="/teachers/onboarding" element={<TeacherOnboardingLayout />}>
              <Route index element={<Navigate to="/teachers/onboarding/profile" replace />} />
              <Route path="profile" element={<TeacherOnboardingProfilePage />} />
              <Route path="review" element={<TeacherApplicationReviewPage />} />
              <Route path="interview" element={<TeacherInterviewVettingPage />} />
              <Route path="bank-details" element={<TeacherOnboardingBankDetailsPage />} />
              <Route path="payout" element={<TeacherOnboardingBankDetailsPage />} />
            </Route>

            {/* 4.2 Standard Creator Studio Portal (Full Sidebar, Unlocked after Onboarding) */}
            <Route path="/teachers/dashboard" element={<DashboardLayout role="teacher" />}>
              <Route index element={<TeacherDashboardPage />} />
            </Route>
            <Route path="/teachers/courses" element={<DashboardLayout role="teacher" />}>
              <Route index element={<TeacherCoursesPage />} />
              <Route path=":id" element={<TeacherCourseDetailPage />} />
              <Route path=":id/curriculum" element={<TeacherCurriculumPage />} />
            </Route>
            <Route path="/teachers/wallet" element={<DashboardLayout role="teacher" />}>
              <Route index element={<UserWalletPage />} />
            </Route>
            <Route path="/teachers/profile" element={<DashboardLayout role="teacher" />}>
              <Route index element={<TeacherProfilePage />} />
            </Route>
            <Route path="/teachers/bank-details" element={<DashboardLayout role="teacher" />}>
              <Route index element={<UserBankDetailsPage />} />
            </Route>
            <Route path="/teachers/password" element={<DashboardLayout role="teacher" />}>
              <Route index element={<ChangePasswordPage role="teacher" />} />
            </Route>
            <Route path="/teachers/plans" element={<DashboardLayout role="teacher" />}>
              <Route index element={<TeacherPlansPage />} />
              <Route path="browse" element={<TeacherPlansBrowsePage />} />
              <Route path="checkout" element={<TeacherPlanCheckoutPage />} />
              <Route path="success" element={<TeacherPlanSuccessPage />} />
              <Route path="failed" element={<TeacherPlanFailedPage />} />
            </Route>

            {/* Aliases for teacher routes */}
            <Route path="/teachers/interviews" element={<Navigate to="/teachers/dashboard" replace />} />
            <Route path="/teacher/dashboard" element={<Navigate to="/teachers/dashboard" replace />} />
            <Route path="/teacher/courses" element={<Navigate to="/teachers/courses" replace />} />
            <Route path="/courses/teacher" element={<Navigate to="/teachers/courses" replace />} />
            <Route path="/courses/teachers" element={<Navigate to="/teachers/courses" replace />} />
            <Route path="/teacher/wallet" element={<Navigate to="/teachers/wallet" replace />} />
            <Route path="/teachers/wallets" element={<Navigate to="/teachers/wallet" replace />} />
            <Route path="/teacher/wallets" element={<Navigate to="/teachers/wallet" replace />} />
            <Route path="/teachers/earnings" element={<Navigate to="/teachers/wallet" replace />} />
            <Route path="/teachers/payouts" element={<Navigate to="/teachers/wallet" replace />} />
            <Route path="/teacher/payouts" element={<Navigate to="/teachers/wallet" replace />} />
            <Route path="/teacher/profile" element={<Navigate to="/teachers/profile" replace />} />
            <Route path="/teacher/bank-details" element={<Navigate to="/teachers/bank-details" replace />} />
            <Route path="/teachers/banks" element={<Navigate to="/teachers/bank-details" replace />} />
            <Route path="/teacher/banks" element={<Navigate to="/teachers/bank-details" replace />} />
            <Route path="/teacher/onboarding" element={<Navigate to="/teachers/onboarding/profile" replace />} />
            <Route path="/teachers/profile/password" element={<Navigate to="/teachers/password" replace />} />
            <Route path="/teacher/password" element={<Navigate to="/teachers/password" replace />} />
            <Route path="/teacher/plans" element={<Navigate to="/teachers/plans" replace />} />
            <Route path="/teacher/plans/browse" element={<Navigate to="/teachers/plans/browse" replace />} />
            <Route path="/teacher/plans/checkout" element={<Navigate to="/teachers/plans/checkout" replace />} />
            <Route path="/teacher/plans/success" element={<Navigate to="/teachers/plans/success" replace />} />
            <Route path="/teacher/plans/failed" element={<Navigate to="/teachers/plans/failed" replace />} />
            <Route path="/teachers/billing" element={<Navigate to="/teachers/plans" replace />} />
            <Route path="/teachers/my-interviews" element={<Navigate to="/teachers/dashboard" replace />} />
            <Route path="/teacher/interviews" element={<Navigate to="/teachers/dashboard" replace />} />
          </Route>
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
            <Route path=":id" element={<AdminUserDetailPage />} />
          </Route>
          <Route path="/admin/users" element={<DashboardLayout role="admin" />}>
            <Route index element={<AdminStudentsPage />} />
            <Route path=":id" element={<AdminUserDetailPage />} />
          </Route>
          <Route path="/admin/wallets" element={<DashboardLayout role="admin" />}>
            <Route index element={<AdminWalletsPage />} />
          </Route>
          <Route path="/admin/payouts" element={<DashboardLayout role="admin" />}>
            <Route index element={<AdminPayoutsPage />} />
          </Route>
          <Route path="/admin/bank-details" element={<DashboardLayout role="admin" />}>
            <Route index element={<AdminBanksPage />} />
            <Route path=":id" element={<AdminBankDetailPage />} />
          </Route>
          <Route path="/admin/courses" element={<DashboardLayout role="admin" />}>
            <Route index element={<AdminCoursesPage />} />
            <Route path=":id" element={<AdminCourseDetailPage />} />
          </Route>
          <Route path="/admin/plans" element={<DashboardLayout role="admin" />}>
            <Route index element={<AdminPlansPage />} />
            <Route path="new" element={<AdminPlanFormPage />} />
            <Route path=":id" element={<AdminPlanDetailsPage />} />
            <Route path=":id/edit" element={<AdminPlanFormPage />} />
          </Route>
          <Route path="/admin/subscriptions" element={<DashboardLayout role="admin" />}>
            <Route index element={<AdminSubscriptionsPage />} />
            <Route path=":id" element={<AdminSubscriptionDetailPage />} />
          </Route>
          <Route path="/admin/offers" element={<DashboardLayout role="admin" />}>
            <Route index element={<AdminOffersPage />} />
          </Route>
          <Route path="/admin/categories" element={<DashboardLayout role="admin" />}>
            <Route index element={<AdminCategoriesPage />} />
          </Route>
          <Route path="/admin/ai-config" element={<DashboardLayout role="admin" />}>
            <Route index element={<AdminAIConfigPage />} />
          </Route>
          <Route path="/admin/interviews" element={<DashboardLayout role="admin" />}>
            <Route index element={<AdminInterviewsPage />} />
            <Route path=":id" element={<AdminInterviewDetailPage />} />
          </Route>
          <Route path="/admin/wallet" element={<Navigate to="/admin/wallets" replace />} />
          <Route path="/admin/payout" element={<Navigate to="/admin/payouts" replace />} />
          <Route path="/admin/banks" element={<Navigate to="/admin/bank-details" replace />} />
          <Route path="/admin/profile/password" element={<Navigate to="/admin/password" replace />} />
          <Route path="/admin/promos" element={<Navigate to="/admin/offers" replace />} />
          <Route path="/admin/offer" element={<Navigate to="/admin/offers" replace />} />
          <Route path="/admin/students" element={<Navigate to="/admin/users" replace />} />
          <Route path="/admin/course" element={<Navigate to="/admin/courses" replace />} />
          <Route path="/courses/admin" element={<Navigate to="/admin/courses" replace />} />
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
    return <Navigate to="/teachers/dashboard" replace />;
  }
  if (user?.role === "ADMIN" || user?.role === "admin") {
    return <Navigate to="/admin/interviews" replace />;
  }
  return <Navigate to="/students/dashboard" replace />;
}

export default AppRoutes
