import { Request, Response, NextFunction } from "express";
import { EnrollFreeCourseUseCase } from "../../application/use-cases/enroll-free-course.usecase";
import { CreateCourseCheckoutOrderUseCase } from "../../application/use-cases/create-course-order.usecase";
import { VerifyCoursePaymentUseCase } from "../../application/use-cases/verify-course-payment.usecase";
import { PayWithWalletUseCase } from "../../application/use-cases/pay-with-wallet.usecase";
import { GetStudentEnrollmentsUseCase } from "../../application/use-cases/get-student-enrollments.usecase";
import { GetCourseClassroomUseCase } from "../../application/use-cases/get-course-classroom.usecase";
import { MarkClassAttendanceUseCase } from "../../application/use-cases/mark-class-attendance.usecase";
import { UpdateLessonProgressUseCase } from "../../application/use-cases/update-lesson-progress.usecase";
import { RequestCourseRefundUseCase } from "../../application/use-cases/request-course-refund.usecase";
import { ClaimCertificateUseCase } from "../../application/use-cases/claim-certificate.usecase";
import { GetCertificateUseCase } from "../../application/use-cases/get-certificate.usecase";
import { TeacherGetCourseStudentsUseCase } from "../../application/use-cases/teacher-get-course-students.usecase";
import { TeacherGetEnrollmentsUseCase } from "../../application/use-cases/teacher-get-enrollments.usecase";
import { TeacherGetEnrollmentDetailUseCase } from "../../application/use-cases/teacher-get-enrollment-detail.usecase";
import { AdminGetEnrollmentsUseCase } from "../../application/use-cases/admin-get-enrollments.usecase";
import { AdminGetEnrollmentDetailUseCase } from "../../application/use-cases/admin-get-enrollment-detail.usecase";

import { EnrollFreeController } from "./enroll-free.controller";
import { CreateCourseOrderController } from "./create-course-order.controller";
import { VerifyCoursePaymentController } from "./verify-course-payment.controller";
import { PayWithWalletController } from "./pay-with-wallet.controller";
import { GetMyEnrollmentsController } from "./get-my-enrollments.controller";
import { GetClassroomController } from "./get-classroom.controller";
import { MarkAttendanceController } from "./mark-attendance.controller";
import { UpdateProgressController } from "./update-progress.controller";
import { RequestRefundController } from "./request-refund.controller";
import { ClaimCertificateController } from "./claim-certificate.controller";
import { GetCertificateController } from "./get-certificate.controller";
import { TeacherGetCourseStudentsController } from "./teacher-get-course-students.controller";
import { AdminListEnrollmentsController } from "./admin-list-enrollments.controller";
import { AdminGetEnrollmentDetailController } from "./admin-get-enrollment-detail.controller";
import { TeacherListEnrollmentsController } from "./teacher-list-enrollments.controller";
import { TeacherGetEnrollmentDetailController } from "./teacher-get-enrollment-detail.controller";

export class EnrollmentController {
  private readonly enrollFreeController: EnrollFreeController;
  private readonly createOrderController: CreateCourseOrderController;
  private readonly verifyPaymentController: VerifyCoursePaymentController;
  private readonly payWithWalletController: PayWithWalletController;
  private readonly getStudentEnrollmentsController: GetMyEnrollmentsController;
  private readonly getClassroomController: GetClassroomController;
  private readonly markAttendanceController: MarkAttendanceController;
  private readonly updateProgressController: UpdateProgressController;
  private readonly requestRefundController: RequestRefundController;
  private readonly claimCertificateController: ClaimCertificateController;
  private readonly getCertificateController: GetCertificateController;
  private readonly teacherGetStudentsController: TeacherGetCourseStudentsController;
  private readonly adminGetEnrollmentsController: AdminListEnrollmentsController;
  private readonly adminGetEnrollmentDetailController: AdminGetEnrollmentDetailController;
  private readonly teacherGetEnrollmentsController: TeacherListEnrollmentsController;
  private readonly teacherGetEnrollmentDetailController: TeacherGetEnrollmentDetailController;

  constructor(
    enrollFreeUseCase: EnrollFreeCourseUseCase,
    createOrderUseCase: CreateCourseCheckoutOrderUseCase,
    verifyPaymentUseCase: VerifyCoursePaymentUseCase,
    payWithWalletUseCase: PayWithWalletUseCase,
    getStudentEnrollmentsUseCase: GetStudentEnrollmentsUseCase,
    getClassroomUseCase: GetCourseClassroomUseCase,
    markAttendanceUseCase: MarkClassAttendanceUseCase,
    updateProgressUseCase: UpdateLessonProgressUseCase,
    requestRefundUseCase: RequestCourseRefundUseCase,
    claimCertificateUseCase: ClaimCertificateUseCase,
    getCertificateUseCase: GetCertificateUseCase,
    teacherGetStudentsUseCase: TeacherGetCourseStudentsUseCase,
    adminGetEnrollmentsUseCase?: AdminGetEnrollmentsUseCase,
    adminGetEnrollmentDetailUseCase?: AdminGetEnrollmentDetailUseCase,
    teacherGetEnrollmentsUseCase?: TeacherGetEnrollmentsUseCase,
    teacherGetEnrollmentDetailUseCase?: TeacherGetEnrollmentDetailUseCase
  ) {
    this.enrollFreeController = new EnrollFreeController(enrollFreeUseCase);
    this.createOrderController = new CreateCourseOrderController(createOrderUseCase);
    this.verifyPaymentController = new VerifyCoursePaymentController(verifyPaymentUseCase);
    this.payWithWalletController = new PayWithWalletController(payWithWalletUseCase);
    this.getStudentEnrollmentsController = new GetMyEnrollmentsController(getStudentEnrollmentsUseCase);
    this.getClassroomController = new GetClassroomController(getClassroomUseCase);
    this.markAttendanceController = new MarkAttendanceController(markAttendanceUseCase);
    this.updateProgressController = new UpdateProgressController(updateProgressUseCase);
    this.requestRefundController = new RequestRefundController(requestRefundUseCase);
    this.claimCertificateController = new ClaimCertificateController(claimCertificateUseCase);
    this.getCertificateController = new GetCertificateController(getCertificateUseCase);
    this.teacherGetStudentsController = new TeacherGetCourseStudentsController(teacherGetStudentsUseCase);
    this.adminGetEnrollmentsController = new AdminListEnrollmentsController(adminGetEnrollmentsUseCase);
    this.adminGetEnrollmentDetailController = new AdminGetEnrollmentDetailController(adminGetEnrollmentDetailUseCase);
    this.teacherGetEnrollmentsController = new TeacherListEnrollmentsController(teacherGetEnrollmentsUseCase);
    this.teacherGetEnrollmentDetailController = new TeacherGetEnrollmentDetailController(teacherGetEnrollmentDetailUseCase);
  }

  enrollFree = (req: Request, res: Response, next: NextFunction) =>
    this.enrollFreeController.execute(req, res, next);

  createOrder = (req: Request, res: Response, next: NextFunction) =>
    this.createOrderController.execute(req, res, next);

  verifyPayment = (req: Request, res: Response, next: NextFunction) =>
    this.verifyPaymentController.execute(req, res, next);

  payWithWallet = (req: Request, res: Response, next: NextFunction) =>
    this.payWithWalletController.execute(req, res, next);

  getMyEnrollments = (req: Request, res: Response, next: NextFunction) =>
    this.getStudentEnrollmentsController.execute(req, res, next);

  getClassroom = (req: Request, res: Response, next: NextFunction) =>
    this.getClassroomController.execute(req, res, next);

  markAttendance = (req: Request, res: Response, next: NextFunction) =>
    this.markAttendanceController.execute(req, res, next);

  updateProgress = (req: Request, res: Response, next: NextFunction) =>
    this.updateProgressController.execute(req, res, next);

  requestRefund = (req: Request, res: Response, next: NextFunction) =>
    this.requestRefundController.execute(req, res, next);

  claimCertificate = (req: Request, res: Response, next: NextFunction) =>
    this.claimCertificateController.execute(req, res, next);

  getCertificate = (req: Request, res: Response, next: NextFunction) =>
    this.getCertificateController.execute(req, res, next);

  getTeacherCourseStudents = (req: Request, res: Response, next: NextFunction) =>
    this.teacherGetStudentsController.execute(req, res, next);

  adminListEnrollments = (req: Request, res: Response, next: NextFunction) =>
    this.adminGetEnrollmentsController.execute(req, res, next);

  adminGetEnrollmentDetail = (req: Request, res: Response, next: NextFunction) =>
    this.adminGetEnrollmentDetailController.execute(req, res, next);

  teacherListEnrollments = (req: Request, res: Response, next: NextFunction) =>
    this.teacherGetEnrollmentsController.execute(req, res, next);

  teacherGetEnrollmentDetail = (req: Request, res: Response, next: NextFunction) =>
    this.teacherGetEnrollmentDetailController.execute(req, res, next);
}
