import { CourseRefundEntity, CourseCertificateEntity } from "./refund.entity";

export type EnrollmentStatus = "ACTIVE" | "COMPLETED" | "REFUNDED" | "CANCELLED";
export type LiveClassStatus = "SCHEDULED" | "LIVE_NOW" | "COMPLETED" | "CANCELLED";
export type RefundStatus = "PENDING" | "APPROVED" | "REJECTED" | "PROCESSED";
export type RefundDestination = "WALLET" | "ORIGINAL_PAYMENT_METHOD";

export interface CourseEnrollmentEntity {
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
  refundEligibleUntil: Date;
  enrolledAt: Date;
  firstAccessedAt: Date | null;
  completedAt: Date | null;
  progressPercentage: number;
  attendedClassesCount: number;
  completedLessonsCount: number;
  lastAccessedLessonId: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Joined metadata
  courseTitle?: string;
  courseSlug?: string;
  courseThumbnail?: string | null;
  courseLevel?: string;
  courseStartingDate?: Date | null;
  totalLessons?: number;
  instructorName?: string;
  instructorEmail?: string;
  instructorAvatar?: string | null;
  studentName?: string;
  studentEmail?: string;
  studentAvatar?: string | null;
  refund?: CourseRefundEntity | null;
  certificate?: CourseCertificateEntity | null;
}

