export type EnrollmentStatus = "ACTIVE" | "COMPLETED" | "REFUNDED" | "CANCELLED";
export type LiveClassStatus = "SCHEDULED" | "LIVE_NOW" | "COMPLETED" | "CANCELLED";
export type RefundDestination = "WALLET" | "ORIGINAL_PAYMENT_METHOD";

export interface CourseEnrollment {
  id: string;
  studentId: string;
  courseId: string;
  status: EnrollmentStatus;
  originalPrice: number;
  discountAmount: number;
  finalAmount: number;
  currency: string;
  paymentMethod: string;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  invoiceNumber: string | null;
  teacherCouponId: string | null;
  appliedCouponCode: string | null;
  refundEligibleUntil: string;
  enrolledAt: string;
  firstAccessedAt: string | null;
  completedAt: string | null;
  progressPercentage: number;
  attendedClassesCount: number;
  completedLessonsCount: number;
  lastAccessedLessonId: string | null;
  createdAt: string;
  updatedAt: string;

  // Joined metadata
  courseTitle?: string;
  courseSlug?: string;
  courseThumbnail?: string | null;
  courseLevel?: string;
  courseStartingDate?: string | null;
  totalLessons?: number;
  instructorName?: string;
  instructorAvatar?: string | null;
  studentName?: string;
  studentEmail?: string;

  // 20-Day / 4-Classes Guarantee Metrics
  isRefundEligible?: boolean;
  daysRemainingForRefund?: number;
  classesConductedCount?: number;
}

export interface CheckoutOrderResult {
  orderId: string;
  courseId: string;
  courseTitle: string;
  originalPrice: number;
  couponDiscount: number;
  appliedCouponCode: string | null;
  walletDeductedAmount: number;
  finalPayableAmount: number;
  currency: string;
  isFullyPaidByWallet: boolean;
  razorpayKeyId?: string;
}

export interface CreateOrderPayload {
  courseId: string;
  couponCode?: string;
  useWalletBalance?: boolean;
}

export interface VerifyPaymentPayload {
  courseId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  couponCode?: string;
  walletDeductionAmount?: number;
}

export interface PayWithWalletPayload {
  courseId: string;
  couponCode?: string;
}

export interface RequestRefundPayload {
  reason: string;
  destination: RefundDestination;
}

export interface ClassroomLesson {
  id: string;
  title: string;
  description: string | null;
  lessonType: string;
  durationSeconds: number;
  sortOrder: number;
  scheduledAt: string | null;
  isLiveNow: boolean;
  recordingUrl: string | null;
  liveStatus: string;
  videoUrl: string | null;
  articleBody: string | null;
  attachments: any;
  isCompleted: boolean;
  attendedLive: boolean;
  lastPositionSeconds: number;
}

export interface ClassroomModule {
  id: string;
  title: string;
  description: string | null;
  sortOrder: number;
  lessons: ClassroomLesson[];
}

export interface CourseClassroomResponse {
  enrollment: {
    id: string;
    status: EnrollmentStatus;
    progressPercentage: number;
    attendedClassesCount: number;
    completedLessonsCount: number;
    totalLessons: number;
    enrolledAt: string;
    refundEligibleUntil: string;
    isRefundEligible: boolean;
    daysRemainingForRefund: number;
    classesConductedCount: number;
    isCertificateClaimed: boolean;
    certificateCode?: string;
  };
  course: {
    id: string;
    title: string;
    slug: string;
    subtitle: string | null;
    description: string | null;
    startingDate: string | null;
    level: string;
    instructor: {
      name: string;
      avatar: string | null;
      bio: string | null;
    };
  };
  modules: ClassroomModule[];
}

export interface CourseCertificate {
  id: string;
  enrollmentId: string;
  certificateCode: string;
  studentName: string;
  courseTitle: string;
  instructorName: string;
  issuedAt: string;
  pdfUrl: string | null;
}

export interface CourseRefund {
  id: string;
  enrollmentId: string;
  studentId: string;
  amount: number;
  currency: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "PROCESSED";
  destination: RefundDestination;
  gatewayRefundId?: string | null;
  classesConductedAtRefund: number;
  classesAttendedAtRefund: number;
  daysElapsedAtRefund: number;
  processedAt: string;
  createdAt: string;
}

export interface LessonProgress {
  id: string;
  enrollmentId: string;
  lessonId: string;
  isCompleted: boolean;
  completedAt: string | null;
  attendedLive: boolean;
  attendedAt: string | null;
  liveAttendanceMinutes: number;
  lastPositionSeconds: number;
  lessonTitle?: string;
  lessonType?: string;
  scheduledAt?: string | null;
  liveStatus?: string;
}

export interface AdminEnrollmentMetrics {
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  refundedEnrollments: number;
  totalRevenue: number;
  totalRefundedAmount: number;
  totalDiscounts: number;
}

export interface AdminEnrollmentsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  courseId?: string;
  paymentMethod?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface AdminEnrollmentsResponse {
  items: CourseEnrollment[];
  total: number;
  metrics: AdminEnrollmentMetrics;
}

export interface AdminEnrollmentDetailResponse {
  enrollment: CourseEnrollment & {
    instructorEmail?: string;
    studentAvatar?: string | null;
  };
  lessonProgress: LessonProgress[];
  refund: CourseRefund | null;
  certificate: CourseCertificate | null;
}

