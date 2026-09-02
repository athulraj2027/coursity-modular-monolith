export interface AuthFormConfig {
  tagline: string
  title: string
  subtitle: string
  nameLabel?: string
  namePlaceholder?: string
  emailLabel?: string
  emailPlaceholder?: string
  passwordLabel?: string
  passwordPlaceholder?: string
  otpLabel?: string
  otpPlaceholder?: string
  newPasswordLabel?: string
  newPasswordPlaceholder?: string
  confirmPasswordLabel?: string
  confirmPasswordPlaceholder?: string
  buttonText: string
  signinPrompt?: string
  signinLinkText?: string
  signinHref?: string
  signupPrompt?: string
  signupLinkText?: string
  signupHref?: string
  forgotPasswordPrompt?: string
  forgotPasswordLinkText?: string
  forgotPasswordHref?: string
  successTitle: string
  successSubtitle: string
  successButtonText: string
}

// Student Signup & Signin
export const STUDENT_SIGNUP_CONFIG: AuthFormConfig = {
  tagline: "JOIN COURSITY",
  title: "Create Your Account",
  subtitle: "Master modern tech skills with interactive, project-based engineering tracks.",
  nameLabel: "Full Name",
  namePlaceholder: "Alex Turing",
  emailLabel: "Email Address",
  emailPlaceholder: "alex@example.com",
  passwordLabel: "Password",
  passwordPlaceholder: "••••••••",
  confirmPasswordLabel: "Confirm Password",
  confirmPasswordPlaceholder: "••••••••",
  buttonText: "Create Account",
  signinPrompt: "Already have an account?",
  signinLinkText: "Sign In",
  signinHref: "/signin",
  successTitle: "Welcome to Coursity!",
  successSubtitle:
    "Your student account has been created. Start exploring engineering tracks and live cohorts.",
  successButtonText: "Explore Courses",
}

export const STUDENT_SIGNIN_CONFIG: AuthFormConfig = {
  tagline: "WELCOME BACK",
  title: "Sign in to Coursity",
  subtitle: "Continue your engineering journey and access your learning dashboard.",
  emailLabel: "Email Address",
  emailPlaceholder: "alex@example.com",
  passwordLabel: "Password",
  passwordPlaceholder: "••••••••",
  buttonText: "Sign In",
  forgotPasswordPrompt: "Forgot your password?",
  forgotPasswordLinkText: "Forgot Password?",
  forgotPasswordHref: "/forgot-password",
  signupPrompt: "Don't have an account?",
  signupLinkText: "Create an Account",
  signupHref: "/signup",
  successTitle: "Signed In Successfully!",
  successSubtitle: "Redirecting to your learning dashboard...",
  successButtonText: "Go to Dashboard",
}

// Teacher Signup & Signin
export const TEACHER_SIGNUP_CONFIG: AuthFormConfig = {
  tagline: "START TEACHING TODAY",
  title: "Create Your Teacher Account",
  subtitle: "Join thousands of teachers creating world-class courses and live cohorts.",
  nameLabel: "Full Name",
  namePlaceholder: "Ada Lovelace",
  emailLabel: "Work Email",
  emailPlaceholder: "ada@example.com",
  passwordLabel: "Password",
  passwordPlaceholder: "••••••••",
  confirmPasswordLabel: "Confirm Password",
  confirmPasswordPlaceholder: "••••••••",
  buttonText: "Create Teacher Account",
  signinPrompt: "Already a teacher?",
  signinLinkText: "Sign In",
  signinHref: "/teachers/signin",
  successTitle: "Welcome to Coursity!",
  successSubtitle:
    "Your teacher account has been created. Check your email to verify and access your studio.",
  successButtonText: "Go to Dashboard",
}

export const TEACHER_SIGNIN_CONFIG: AuthFormConfig = {
  tagline: "TEACHER PORTAL",
  title: "Sign in to Studio",
  subtitle: "Manage your courses, student submissions, and live cohorts.",
  emailLabel: "Work Email",
  emailPlaceholder: "ada@example.com",
  passwordLabel: "Password",
  passwordPlaceholder: "••••••••",
  buttonText: "Sign In as Teacher",
  forgotPasswordPrompt: "Forgot your password?",
  forgotPasswordLinkText: "Forgot Password?",
  forgotPasswordHref: "/teachers/forgot-password",
  signupPrompt: "First time here teacher?",
  signupLinkText: "Create an Account",
  signupHref: "/teachers/signup",
  successTitle: "Welcome Back, Instructor!",
  successSubtitle: "Redirecting to your course studio...",
  successButtonText: "Open Studio",
}

// Admin Signin
export const ADMIN_SIGNIN_CONFIG: AuthFormConfig = {
  tagline: "ADMINISTRATOR ACCESS",
  title: "Admin Console Sign In",
  subtitle: "Authorized personnel access for platform moderation, telemetry, and management.",
  emailLabel: "Admin Email",
  emailPlaceholder: "admin@coursity.io",
  passwordLabel: "Master Password",
  passwordPlaceholder: "••••••••",
  buttonText: "Authenticate Admin",
  successTitle: "Administrator Authenticated",
  successSubtitle: "Initializing administrative session...",
  successButtonText: "Open Admin Console",
}

// Verify OTP Configs
export const STUDENT_VERIFY_OTP_CONFIG: AuthFormConfig = {
  tagline: "VERIFICATION CODE",
  title: "Verify Your Email",
  subtitle: "We sent a 6-digit verification code to your email address.",
  emailLabel: "Email Address",
  emailPlaceholder: "alex@example.com",
  otpLabel: "6-Digit OTP Code",
  otpPlaceholder: "123456",
  buttonText: "Verify & Continue",
  signinPrompt: "Didn't receive the code?",
  signinLinkText: "Resend Code",
  signinHref: "#resend",
  successTitle: "Email Verified!",
  successSubtitle: "Your email has been confirmed. Redirecting to your dashboard...",
  successButtonText: "Continue to Courses",
}

export const TEACHER_VERIFY_OTP_CONFIG: AuthFormConfig = {
  tagline: "TEACHER VERIFICATION",
  title: "Verify Teacher Account",
  subtitle: "Enter the 6-digit authentication code sent to your work email.",
  emailLabel: "Work Email",
  emailPlaceholder: "ada@example.com",
  otpLabel: "6-Digit Security Code",
  otpPlaceholder: "123456",
  buttonText: "Verify & Open Studio",
  signinPrompt: "Didn't receive the code?",
  signinLinkText: "Resend Code",
  signinHref: "#resend",
  successTitle: "Account Verified!",
  successSubtitle: "Your teacher access has been approved. Redirecting to studio...",
  successButtonText: "Go to Studio",
}

// Forgot Password Configs
export const STUDENT_FORGOT_PASSWORD_CONFIG: AuthFormConfig = {
  tagline: "PASSWORD RECOVERY",
  title: "Forgot Your Password?",
  subtitle: "Enter your registered email address and we'll send you an OTP to reset your password.",
  emailLabel: "Email Address",
  emailPlaceholder: "alex@example.com",
  buttonText: "Send Reset Code",
  signinPrompt: "Remember your password?",
  signinLinkText: "Back to Sign In",
  signinHref: "/signin",
  successTitle: "Reset Code Sent!",
  successSubtitle: "We've dispatched a 6-digit recovery OTP to your inbox. Use it to reset your password.",
  successButtonText: "Enter Reset OTP",
}

export const TEACHER_FORGOT_PASSWORD_CONFIG: AuthFormConfig = {
  tagline: "TEACHER SECURITY",
  title: "Reset Studio Password",
  subtitle: "Enter your registered teacher email to receive a secure recovery OTP.",
  emailLabel: "Work Email",
  emailPlaceholder: "ada@example.com",
  buttonText: "Send Security OTP",
  signinPrompt: "Remember your password?",
  signinLinkText: "Back to Sign In",
  signinHref: "/teachers/signin",
  successTitle: "Security OTP Dispatched!",
  successSubtitle: "Check your work email for the 6-digit reset code to restore studio access.",
  successButtonText: "Enter Reset Code",
}

// Reset Password Configs
export const STUDENT_RESET_PASSWORD_CONFIG: AuthFormConfig = {
  tagline: "SECURE RESET",
  title: "Reset Your Password",
  subtitle: "Enter the 6-digit OTP received in your inbox along with your new password.",
  emailLabel: "Email Address",
  emailPlaceholder: "alex@example.com",
  otpLabel: "6-Digit Recovery OTP",
  otpPlaceholder: "123456",
  newPasswordLabel: "New Password",
  newPasswordPlaceholder: "••••••••",
  confirmPasswordLabel: "Confirm New Password",
  confirmPasswordPlaceholder: "••••••••",
  buttonText: "Update Password",
  signinPrompt: "Remember your password?",
  signinLinkText: "Back to Sign In",
  signinHref: "/signin",
  successTitle: "Password Updated!",
  successSubtitle: "Your account password has been reset successfully. You can now sign in.",
  successButtonText: "Sign In Now",
}

export const TEACHER_RESET_PASSWORD_CONFIG: AuthFormConfig = {
  tagline: "STUDIO SECURITY",
  title: "Set New Studio Password",
  subtitle: "Enter your security OTP and choose a strong password for your teacher account.",
  emailLabel: "Work Email",
  emailPlaceholder: "ada@example.com",
  otpLabel: "6-Digit Security OTP",
  otpPlaceholder: "123456",
  newPasswordLabel: "New Password",
  newPasswordPlaceholder: "••••••••",
  confirmPasswordLabel: "Confirm New Password",
  confirmPasswordPlaceholder: "••••••••",
  buttonText: "Update Studio Password",
  signinPrompt: "Remember your password?",
  signinLinkText: "Back to Sign In",
  signinHref: "/teachers/signin",
  successTitle: "Studio Password Updated!",
  successSubtitle: "Your teacher account credentials have been refreshed. Please sign in.",
  successButtonText: "Sign In to Studio",
}