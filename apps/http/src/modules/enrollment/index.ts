import defaultPrisma from "@/infrastructure/database/prisma.client";
import { PrismaEnrollmentRepository } from "./infrastructure/repositories/prisma-enrollment.repository";
import { couponRepo, validateCouponUseCase } from "@/modules/coupon";
import paymentGateway from "@/infrastructure/payment";
import emailService from "@/infrastructure/email";

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

export function createEnrollmentModule() {
  const enrollmentRepo = new PrismaEnrollmentRepository(defaultPrisma);

  const enrollFreeUseCase = new EnrollFreeCourseUseCase(enrollmentRepo);
  const createOrderUseCase = new CreateCourseCheckoutOrderUseCase(validateCouponUseCase, paymentGateway);
  const verifyPaymentUseCase = new VerifyCoursePaymentUseCase(enrollmentRepo, couponRepo, paymentGateway, emailService);
  const payWithWalletUseCase = new PayWithWalletUseCase(enrollmentRepo, couponRepo, emailService);
  const getStudentEnrollmentsUseCase = new GetStudentEnrollmentsUseCase(enrollmentRepo);
  const getClassroomUseCase = new GetCourseClassroomUseCase(enrollmentRepo);
  const markAttendanceUseCase = new MarkClassAttendanceUseCase(enrollmentRepo);
  const updateProgressUseCase = new UpdateLessonProgressUseCase(enrollmentRepo);
  const requestRefundUseCase = new RequestCourseRefundUseCase(enrollmentRepo, paymentGateway, emailService);
  const claimCertificateUseCase = new ClaimCertificateUseCase(enrollmentRepo);
  const getCertificateUseCase = new GetCertificateUseCase(enrollmentRepo);
  const teacherGetStudentsUseCase = new TeacherGetCourseStudentsUseCase(enrollmentRepo);
  const adminGetEnrollmentsUseCase = new AdminGetEnrollmentsUseCase(enrollmentRepo);
  const adminGetEnrollmentDetailUseCase = new AdminGetEnrollmentDetailUseCase(enrollmentRepo);
  const teacherGetEnrollmentsUseCase = new TeacherGetEnrollmentsUseCase(enrollmentRepo);
  const teacherGetEnrollmentDetailUseCase = new TeacherGetEnrollmentDetailUseCase(enrollmentRepo);

  const enrollmentController = new EnrollmentController(
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
    teacherGetEnrollmentDetailUseCase
  );

  const enrollmentRouter = createEnrollmentRouter(enrollmentController);

  return {
    enrollmentRepo,
    enrollmentController,
    enrollmentRouter,
    adminGetEnrollmentsUseCase,
    adminGetEnrollmentDetailUseCase,
    teacherGetEnrollmentsUseCase,
    teacherGetEnrollmentDetailUseCase,
  };
}

const defaultModule = createEnrollmentModule();
export const enrollmentRouter = defaultModule.enrollmentRouter;
export const enrollmentRepo = defaultModule.enrollmentRepo;
export default enrollmentRouter;

