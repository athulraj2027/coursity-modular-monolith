import { IBaseRepository } from "@/shared/domain/repositories/base.repository.interface";
import {
  CourseEnrollmentEntity,
  EnrollmentStatus,
} from "../entities/enrollment.entity";
import { LessonProgressEntity } from "../entities/lesson-progress.entity";
import { CourseRefundEntity, CourseCertificateEntity } from "../entities/refund.entity";

export interface CreateEnrollmentData {
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
}

export interface UpsertLessonProgressData {
  enrollmentId: string;
  lessonId: string;
  isCompleted?: boolean;
  attendedLive?: boolean;
  liveAttendanceMinutes?: number;
  lastPositionSeconds?: number;
}

export interface CreateRefundData {
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
}

export interface CreateCertificateData {
  enrollmentId: string;
  certificateCode: string;
  studentName: string;
  courseTitle: string;
  instructorName: string;
}

export interface ListEnrollmentsFilter {
  search?: string;
  status?: EnrollmentStatus;
  courseId?: string;
  teacherUserId?: string;
  paymentMethod?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ListEnrollmentsResult {
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
}

export interface EnrollmentDetailResult {
  enrollment: CourseEnrollmentEntity;
  lessonProgress: LessonProgressEntity[];
  refund: CourseRefundEntity | null;
  certificate: CourseCertificateEntity | null;
}

/**
 * 1. Student Enrollment Repository (ISP)
 */
export interface IStudentEnrollmentRepository {
  createEnrollment(data: CreateEnrollmentData): Promise<CourseEnrollmentEntity>;
  findEnrollmentById(id: string): Promise<CourseEnrollmentEntity | null>;
  findEnrollmentByStudentAndCourse(studentId: string, courseId: string): Promise<CourseEnrollmentEntity | null>;
  listStudentEnrollments(studentId: string, status?: EnrollmentStatus): Promise<CourseEnrollmentEntity[]>;
  updateEnrollment(id: string, data: Partial<CourseEnrollmentEntity>): Promise<CourseEnrollmentEntity>;
}

/**
 * 2. Lesson Progress & Attendance Repository (ISP)
 */
export interface ILessonProgressRepository {
  upsertLessonProgress(data: UpsertLessonProgressData): Promise<LessonProgressEntity>;
  findLessonProgress(enrollmentId: string, lessonId: string): Promise<LessonProgressEntity | null>;
  listLessonProgressForEnrollment(enrollmentId: string): Promise<LessonProgressEntity[]>;
  countConductedClasses(courseId: string): Promise<number>;
  countTotalCourseLessons(courseId: string): Promise<number>;
  countCompletedLessons(enrollmentId: string): Promise<number>;
  countAttendedLessons(enrollmentId: string): Promise<number>;
  findLessonById(lessonId: string): Promise<{ id: string } | null>;
}

/**
 * 3. Course Refund Repository (ISP)
 */
export interface ICourseRefundRepository {
  createRefund(data: CreateRefundData): Promise<CourseRefundEntity>;
  findRefundByEnrollmentId(enrollmentId: string): Promise<CourseRefundEntity | null>;
}

/**
 * 4. Course Certificate Repository (ISP)
 */
export interface ICourseCertificateRepository {
  createCertificate(data: CreateCertificateData): Promise<CourseCertificateEntity>;
  findCertificateByCode(certificateCode: string): Promise<CourseCertificateEntity | null>;
  findCertificateByEnrollmentId(enrollmentId: string): Promise<CourseCertificateEntity | null>;
}

/**
 * 5. Admin Enrollment Repository (ISP)
 */
export interface IAdminEnrollmentRepository {
  listAllEnrollments(filters?: ListEnrollmentsFilter): Promise<ListEnrollmentsResult>;
  findEnrollmentDetail(id: string, teacherUserId?: string): Promise<EnrollmentDetailResult | null>;
}

/**
 * 6. Teacher Enrollment Repository (ISP)
 */
export interface ITeacherEnrollmentRepository {
  listCourseEnrollments(courseId: string): Promise<CourseEnrollmentEntity[]>;
  findEnrollmentDetail(id: string, teacherUserId?: string): Promise<EnrollmentDetailResult | null>;
}

/**
 * 7. Classroom Projection Repository (ISP)
 */
export interface IClassroomRepository {
  findCourseClassroomData(courseIdOrSlug: string): Promise<any | null>;
}

/**
 * 8. Unified Enrollment Repository Interface
 */
export interface IEnrollmentRepository
  extends IStudentEnrollmentRepository,
    ILessonProgressRepository,
    ICourseRefundRepository,
    ICourseCertificateRepository,
    IAdminEnrollmentRepository,
    ITeacherEnrollmentRepository,
    IClassroomRepository,
    IBaseRepository<CourseEnrollmentEntity, string> {
  createEnrollment(data: CreateEnrollmentData): Promise<CourseEnrollmentEntity>;
  findEnrollmentById(id: string): Promise<CourseEnrollmentEntity | null>;
  findEnrollmentByStudentAndCourse(studentId: string, courseId: string): Promise<CourseEnrollmentEntity | null>;
  listStudentEnrollments(studentId: string, status?: EnrollmentStatus): Promise<CourseEnrollmentEntity[]>;
  listCourseEnrollments(courseId: string): Promise<CourseEnrollmentEntity[]>;
  updateEnrollment(id: string, data: Partial<CourseEnrollmentEntity>): Promise<CourseEnrollmentEntity>;
}

/**
 * Backward compatibility alias
 */
export type EnrollmentRepository = IEnrollmentRepository;
