import defaultPrisma from "@/infrastructure/database/prisma.client";
import { PrismaEnrollmentRepository } from "./infrastructure/repositories/prisma-enrollment.repository";
import { couponRepo as defaultCouponRepo, validateCouponUseCase as defaultValidateCouponUseCase } from "@/modules/coupon";
import { courseRepo as defaultCourseRepo } from "@/modules/course";
import { walletRepo as defaultWalletRepo } from "@/modules/wallet";
import { userRepo as defaultUserRepo } from "@/modules/user";
import defaultPaymentGateway from "@/infrastructure/payment";
import defaultEmailService from "@/infrastructure/email";
import {
  ITeacherProfileResolver,
  defaultTeacherProfileResolver,
} from "@/modules/course/domain/services/teacher-profile-resolver.service";
import { IEnrollmentRepository } from "./domain/repositories/enrollment.repository";
import { ICourseRepository } from "@/modules/course/domain/repositories/course.repository";

import { EnrollFreeCourseUseCase } from "./application/use-cases/enroll-free-course.usecase";
import { CreateCourseCheckoutOrderUseCase } from "./application/use-cases/create-course-order.usecase";
import { VerifyCoursePaymentUseCase } from "./application/use-cases/verify-course-payment.usecase";
import { PayWithWalletUseCase } from "./application/use-cases/pay-with-wallet.usecase";
import { GetStudentEnrollmentsUseCase } from "./application/use-cases/get-student-enrollments.usecase";
import { GetCourseClassroomUseCase } from "./application/use-cases/get-course-classroom.usecase";
import { MarkClassAttendanceUseCase } from "./application/use-cases/mark-class-attendance.usecase";
import { UpdateLessonProgressUseCase } from "./application/use-cases/update-lesson-progress.usecase";
import { RequestCourseRefundUseCase } from "./application/use-cases/request-course-refund.usecase";
import { ClaimCertificateUseCase } from "./application/use-cases/claim-certificate.usecase";
import { GetCertificateUseCase } from "./application/use-cases/get-certificate.usecase";
import { TeacherGetCourseStudentsUseCase } from "./application/use-cases/teacher-get-course-students.usecase";
import { TeacherGetEnrollmentsUseCase } from "./application/use-cases/teacher-get-enrollments.usecase";
import { TeacherGetEnrollmentDetailUseCase } from "./application/use-cases/teacher-get-enrollment-detail.usecase";
import { AdminGetEnrollmentsUseCase } from "./application/use-cases/admin-get-enrollments.usecase";
import { AdminGetEnrollmentDetailUseCase } from "./application/use-cases/admin-get-enrollment-detail.usecase";

import { EnrollmentController } from "./presentation/controllers/enrollment.controller";
import { createEnrollmentRouter } from "./presentation/routes/enrollment.routes";

export interface CreateEnrollmentModuleDependencies {
  enrollmentRepo?: IEnrollmentRepository;
  courseRepo?: ICourseRepository;
  couponRepo?: any;
  validateCouponUseCase?: any;
  userRepo?: any;
  walletRepo?: any;
  paymentGateway?: any;
  emailService?: any;
  teacherProfileResolver?: ITeacherProfileResolver;
}

export function createEnrollmentModule(deps: CreateEnrollmentModuleDependencies = {}) {
  const enrollmentRepo = deps.enrollmentRepo || new PrismaEnrollmentRepository(defaultPrisma);
  const courseRepo = deps.courseRepo || defaultCourseRepo;
  const couponRepo = deps.couponRepo || defaultCouponRepo;
  const validateCouponUseCase = deps.validateCouponUseCase || defaultValidateCouponUseCase;
  const userRepo = deps.userRepo || defaultUserRepo;
  const walletRepo = deps.walletRepo || defaultWalletRepo;
  const paymentGateway = deps.paymentGateway || defaultPaymentGateway;
  const emailService = deps.emailService || defaultEmailService;
  const profileResolver = deps.teacherProfileResolver || defaultTeacherProfileResolver;

  const enrollFreeUseCase = new EnrollFreeCourseUseCase(enrollmentRepo, courseRepo);
  const createOrderUseCase = new CreateCourseCheckoutOrderUseCase(
    validateCouponUseCase,
    paymentGateway,
    courseRepo,
    enrollmentRepo,
    walletRepo
  );
  const verifyPaymentUseCase = new VerifyCoursePaymentUseCase(
    enrollmentRepo,
    couponRepo,
    courseRepo,
    userRepo,
    walletRepo,
    paymentGateway,
    emailService
  );
  const payWithWalletUseCase = new PayWithWalletUseCase(
    enrollmentRepo,
    couponRepo,
    courseRepo,
    userRepo,
    walletRepo,
    emailService
  );
  const getStudentEnrollmentsUseCase = new GetStudentEnrollmentsUseCase(enrollmentRepo);
  const getClassroomUseCase = new GetCourseClassroomUseCase(enrollmentRepo);
  const markAttendanceUseCase = new MarkClassAttendanceUseCase(enrollmentRepo);
  const updateProgressUseCase = new UpdateLessonProgressUseCase(enrollmentRepo);
  const requestRefundUseCase = new RequestCourseRefundUseCase(
    enrollmentRepo,
    courseRepo,
    userRepo,
    walletRepo,
    paymentGateway,
    emailService
  );
  const claimCertificateUseCase = new ClaimCertificateUseCase(enrollmentRepo, userRepo);
  const getCertificateUseCase = new GetCertificateUseCase(enrollmentRepo);
  const teacherGetStudentsUseCase = new TeacherGetCourseStudentsUseCase(enrollmentRepo, courseRepo);
  const adminGetEnrollmentsUseCase = new AdminGetEnrollmentsUseCase(enrollmentRepo);
  const adminGetEnrollmentDetailUseCase = new AdminGetEnrollmentDetailUseCase(enrollmentRepo);
  const teacherGetEnrollmentsUseCase = new TeacherGetEnrollmentsUseCase(enrollmentRepo);
  const teacherGetEnrollmentDetailUseCase = new TeacherGetEnrollmentDetailUseCase(enrollmentRepo);

  const enrollmentController = new EnrollmentController({
    enrollFreeUseCase,
    createOrderUseCase,
    verifyPaymentUseCase,
    payWithWalletUseCase,
    getStudentEnrollmentsUseCase,
    getClassroomUseCase,
    markAttendanceUseCase,
    updateProgressUseCase,
    requestRefundUseCase,
    claimCertificateUseCase,
    getCertificateUseCase,
    teacherGetStudentsUseCase,
    adminGetEnrollmentsUseCase,
    adminGetEnrollmentDetailUseCase,
    teacherGetEnrollmentsUseCase,
    teacherGetEnrollmentDetailUseCase,
    teacherProfileResolver: profileResolver,
  });

  const enrollmentRouter = createEnrollmentRouter(enrollmentController);

  return {
    enrollmentRepo,
    enrollmentController,
    enrollmentRouter,
    enrollFreeUseCase,
    createOrderUseCase,
    verifyPaymentUseCase,
    payWithWalletUseCase,
    getStudentEnrollmentsUseCase,
    getClassroomUseCase,
    markAttendanceUseCase,
    updateProgressUseCase,
    requestRefundUseCase,
    claimCertificateUseCase,
    getCertificateUseCase,
    teacherGetStudentsUseCase,
    adminGetEnrollmentsUseCase,
    adminGetEnrollmentDetailUseCase,
    teacherGetEnrollmentsUseCase,
    teacherGetEnrollmentDetailUseCase,
  };
}

const defaultModule = createEnrollmentModule();
export const enrollmentRouter = defaultModule.enrollmentRouter;
export const enrollmentRepo = defaultModule.enrollmentRepo;

export * from "./domain/entities/enrollment.entity";
export * from "./domain/entities/lesson-progress.entity";
export * from "./domain/entities/refund.entity";
export * from "./domain/dtos/enrollment.dto";
export * from "./domain/policies/course-refund.policy";
export * from "./domain/policies/teacher-royalty.policy";
export * from "./domain/policies/course-certificate.policy";
export * from "./domain/repositories/enrollment.repository";
export * from "./infrastructure/repositories/prisma-enrollment.repository";
export * from "./application/use-cases/enroll-free-course.usecase";
export * from "./application/use-cases/create-course-order.usecase";
export * from "./application/use-cases/verify-course-payment.usecase";
export * from "./application/use-cases/pay-with-wallet.usecase";
export * from "./application/use-cases/get-student-enrollments.usecase";
export * from "./application/use-cases/get-course-classroom.usecase";
export * from "./application/use-cases/mark-class-attendance.usecase";
export * from "./application/use-cases/update-lesson-progress.usecase";
export * from "./application/use-cases/request-course-refund.usecase";
export * from "./application/use-cases/claim-certificate.usecase";
export * from "./application/use-cases/get-certificate.usecase";
export * from "./application/use-cases/teacher-get-course-students.usecase";
export * from "./application/use-cases/teacher-get-enrollments.usecase";
export * from "./application/use-cases/teacher-get-enrollment-detail.usecase";
export * from "./application/use-cases/admin-get-enrollments.usecase";
export * from "./application/use-cases/admin-get-enrollment-detail.usecase";
export * from "./presentation/controllers";
export * from "./presentation/schemas/enrollment.schema";
export * from "./presentation/routes/enrollment.routes";

export default enrollmentRouter;
