import { RefundDestination } from "../entities/enrollment.entity";

export interface CreateCourseCheckoutOrderDto {
  courseId: string;
  couponCode?: string;
  useWalletBalance?: boolean;
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

export interface VerifyCoursePaymentDto {
  courseId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  couponCode?: string;
  walletDeductionAmount?: number;
}

export interface PayWithWalletDto {
  courseId: string;
  couponCode?: string;
}

export interface EnrollFreeCourseDto {
  courseId: string;
}

export interface UpdateLessonProgressDto {
  enrollmentId: string;
  lessonId: string;
  isCompleted?: boolean;
  lastPositionSeconds?: number;
}

export interface MarkClassAttendanceDto {
  enrollmentId: string;
  lessonId: string;
  liveAttendanceMinutes?: number;
}

export interface RequestCourseRefundDto {
  enrollmentId: string;
  reason: string;
  destination: RefundDestination;
}

export interface RefundEligibilityCheckResult {
  isEligible: boolean;
  daysElapsed: number;
  daysRemaining: number;
  classesConducted: number;
  classesAttended: number;
  maxDaysAllowed: number; // 20
  maxClassesAllowed: number; // 4
  refundEligibleUntil: Date;
  paidAmount: number;
  reasonIfNotEligible?: string;
}

export interface ClassroomLessonPayload {
  id: string;
  title: string;
  description: string | null;
  lessonType: string;
  durationSeconds: number;
  sortOrder: number;
  scheduledAt: Date | null;
  liveMeetingUrl: string | null;
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

export interface ClassroomModulePayload {
  id: string;
  title: string;
  description: string | null;
  sortOrder: number;
  lessons: ClassroomLessonPayload[];
}

export interface CourseClassroomResponse {
  enrollment: {
    id: string;
    status: string;
    progressPercentage: number;
    attendedClassesCount: number;
    completedLessonsCount: number;
    totalLessons: number;
    enrolledAt: Date;
    refundEligibleUntil: Date;
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
    startingDate: Date | null;
    level: string;
    instructor: {
      name: string;
      avatar: string | null;
      bio: string | null;
    };
  };
  modules: ClassroomModulePayload[];
}
