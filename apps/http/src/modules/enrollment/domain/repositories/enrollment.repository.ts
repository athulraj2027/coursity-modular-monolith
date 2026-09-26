import {
  CourseEnrollmentEntity,
  EnrollmentStatus,
} from "../entities/enrollment.entity";
import { LessonProgressEntity } from "../entities/lesson-progress.entity";
import { CourseRefundEntity, CourseCertificateEntity } from "../entities/refund.entity";

export interface EnrollmentRepository {
  createEnrollment(data: {
    studentId: string;
    courseId: string;
    originalPrice: number;
    discountAmount: number;
    finalAmount: number;
    currency: string;
    paymentMethod: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    invoiceNumber: string;
    teacherCouponId?: string;
    appliedCouponCode?: string;
    refundEligibleUntil: Date;
  }): Promise<CourseEnrollmentEntity>;

  findEnrollmentById(id: string): Promise<CourseEnrollmentEntity | null>;
  findEnrollmentByStudentAndCourse(studentId: string, courseId: string): Promise<CourseEnrollmentEntity | null>;
  listStudentEnrollments(studentId: string, status?: EnrollmentStatus): Promise<CourseEnrollmentEntity[]>;
  listCourseEnrollments(courseId: string): Promise<CourseEnrollmentEntity[]>;
  
  updateEnrollment(id: string, data: Partial<CourseEnrollmentEntity>): Promise<CourseEnrollmentEntity>;

  // Progress & Attendance
  upsertLessonProgress(data: {
    enrollmentId: string;
    lessonId: string;
    isCompleted?: boolean;
    attendedLive?: boolean;
    liveAttendanceMinutes?: number;
    lastPositionSeconds?: number;
  }): Promise<LessonProgressEntity>;

  findLessonProgress(enrollmentId: string, lessonId: string): Promise<LessonProgressEntity | null>;
  listLessonProgressForEnrollment(enrollmentId: string): Promise<LessonProgressEntity[]>;
  
  // Refund
  createRefund(data: {
    enrollmentId: string;
    studentId: string;
    amount: number;
    currency: string;
    reason: string;
    destination: "WALLET" | "ORIGINAL_PAYMENT_METHOD";
    gatewayRefundId?: string;
    classesConductedAtRefund: number;
    classesAttendedAtRefund: number;
    daysElapsedAtRefund: number;
  }): Promise<CourseRefundEntity>;

  findRefundByEnrollmentId(enrollmentId: string): Promise<CourseRefundEntity | null>;

  // Certificate
  createCertificate(data: {
    enrollmentId: string;
    certificateCode: string;
    studentName: string;
    courseTitle: string;
    instructorName: string;
  }): Promise<CourseCertificateEntity>;

  findCertificateByCode(certificateCode: string): Promise<CourseCertificateEntity | null>;
  findCertificateByEnrollmentId(enrollmentId: string): Promise<CourseCertificateEntity | null>;

  // Admin & Teacher Operations
  listAllEnrollments(filters?: {
    search?: string;
    status?: EnrollmentStatus;
    courseId?: string;
    teacherUserId?: string;
    paymentMethod?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<{
    items: CourseEnrollmentEntity[];
    total: number;
    metrics: {
      totalEnrollments: number;
      activeEnrollments: number;
      completedEnrollments: number;
      refundedEnrollments: number;
      totalRevenue: number;
      totalRefundedAmount: number;
      totalDiscounts: number;
    };
  }>;

  findEnrollmentDetail(id: string, teacherUserId?: string): Promise<{
    enrollment: CourseEnrollmentEntity;
    lessonProgress: LessonProgressEntity[];
    refund: CourseRefundEntity | null;
    certificate: CourseCertificateEntity | null;
  } | null>;
}

