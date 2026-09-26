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
import defaultPrisma from "@/infrastructure/database/prisma.client";
import { ForbiddenError, UnauthorizedError } from "@/app/errors";

export class EnrollmentController {
  constructor(
    private readonly enrollFreeUseCase: EnrollFreeCourseUseCase,
    private readonly createOrderUseCase: CreateCourseCheckoutOrderUseCase,
    private readonly verifyPaymentUseCase: VerifyCoursePaymentUseCase,
    private readonly payWithWalletUseCase: PayWithWalletUseCase,
    private readonly getStudentEnrollmentsUseCase: GetStudentEnrollmentsUseCase,
    private readonly getClassroomUseCase: GetCourseClassroomUseCase,
    private readonly markAttendanceUseCase: MarkClassAttendanceUseCase,
    private readonly updateProgressUseCase: UpdateLessonProgressUseCase,
    private readonly requestRefundUseCase: RequestCourseRefundUseCase,
    private readonly claimCertificateUseCase: ClaimCertificateUseCase,
    private readonly getCertificateUseCase: GetCertificateUseCase,
    private readonly teacherGetStudentsUseCase: TeacherGetCourseStudentsUseCase,
    private readonly adminGetEnrollmentsUseCase?: AdminGetEnrollmentsUseCase,
    private readonly adminGetEnrollmentDetailUseCase?: AdminGetEnrollmentDetailUseCase,
    private readonly teacherGetEnrollmentsUseCase?: TeacherGetEnrollmentsUseCase,
    private readonly teacherGetEnrollmentDetailUseCase?: TeacherGetEnrollmentDetailUseCase
  ) {}


  private getUserId(req: Request): string {
    const userId = req.user?.userId;
    if (!userId) {
      throw new UnauthorizedError("Authentication required.");
    }
    return userId;
  }

  private async getTeacherProfileId(userId: string): Promise<string> {
    const profile = await defaultPrisma.teacherProfile.findFirst({
      where: { profile: { userId } },
      select: { id: true },
    });
    if (!profile) {
      throw new ForbiddenError("Teacher profile required.");
    }
    return profile.id;
  }

  enrollFree = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const studentId = this.getUserId(req);
      const { courseId } = req.body;
      const result = await this.enrollFreeUseCase.execute(studentId, courseId);
      return res.status(201).json({
        success: true,
        message: "Enrolled in course successfully.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const studentId = this.getUserId(req);
      const result = await this.createOrderUseCase.execute(studentId, req.body);
      return res.status(200).json({
        success: true,
        message: "Checkout order created.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const studentId = this.getUserId(req);
      const result = await this.verifyPaymentUseCase.execute(studentId, req.body);
      return res.status(201).json({
        success: true,
        message: "Payment verified and course enrollment confirmed.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  payWithWallet = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const studentId = this.getUserId(req);
      const result = await this.payWithWalletUseCase.execute(studentId, req.body);
      return res.status(201).json({
        success: true,
        message: "Enrollment completed using wallet balance.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getMyEnrollments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const studentId = this.getUserId(req);
      const status = req.query.status as any;
      const result = await this.getStudentEnrollmentsUseCase.execute(studentId, status);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getClassroom = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const studentId = this.getUserId(req);
      const courseIdOrSlug = Array.isArray(req.params.courseIdOrSlug)
        ? req.params.courseIdOrSlug[0]
        : req.params.courseIdOrSlug;
      const result = await this.getClassroomUseCase.execute(studentId, courseIdOrSlug);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  markAttendance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const studentId = this.getUserId(req);
      const enrollmentId = Array.isArray(req.params.enrollmentId)
        ? req.params.enrollmentId[0]
        : req.params.enrollmentId;
      const result = await this.markAttendanceUseCase.execute(studentId, {
        enrollmentId,
        ...req.body,
      });
      return res.status(200).json({
        success: true,
        message: "Live class attendance recorded.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  updateProgress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const studentId = this.getUserId(req);
      const enrollmentId = Array.isArray(req.params.enrollmentId)
        ? req.params.enrollmentId[0]
        : req.params.enrollmentId;
      const result = await this.updateProgressUseCase.execute(studentId, {
        enrollmentId,
        ...req.body,
      });
      return res.status(200).json({
        success: true,
        message: "Learning progress updated.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  requestRefund = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const studentId = this.getUserId(req);
      const enrollmentId = Array.isArray(req.params.enrollmentId)
        ? req.params.enrollmentId[0]
        : req.params.enrollmentId;
      const result = await this.requestRefundUseCase.execute(studentId, {
        enrollmentId,
        ...req.body,
      });
      return res.status(200).json({
        success: true,
        message: "100% Full refund processed successfully under 20-Day / 4-Classes guarantee.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  claimCertificate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const studentId = this.getUserId(req);
      const enrollmentId = Array.isArray(req.params.enrollmentId)
        ? req.params.enrollmentId[0]
        : req.params.enrollmentId;
      const result = await this.claimCertificateUseCase.execute(studentId, enrollmentId);
      return res.status(201).json({
        success: true,
        message: "Course completion certificate unlocked!",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getCertificate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const code = Array.isArray(req.params.code) ? req.params.code[0] : req.params.code;
      const result = await this.getCertificateUseCase.execute(code);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getTeacherCourseStudents = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = this.getUserId(req);
      const teacherProfileId = await this.getTeacherProfileId(userId);
      const courseId = Array.isArray(req.params.courseId) ? req.params.courseId[0] : req.params.courseId;
      const result = await this.teacherGetStudentsUseCase.execute(teacherProfileId, courseId);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  adminListEnrollments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!this.adminGetEnrollmentsUseCase) {
        throw new Error("AdminGetEnrollmentsUseCase not initialized.");
      }
      const { search, status, courseId, paymentMethod, page, limit, sortBy, sortOrder } = req.query;
      const result = await this.adminGetEnrollmentsUseCase.execute({
        search: search ? String(search) : undefined,
        status: status ? (String(status) as any) : undefined,
        courseId: courseId ? String(courseId) : undefined,
        paymentMethod: paymentMethod ? String(paymentMethod) : undefined,
        page: page ? parseInt(String(page), 10) : 1,
        limit: limit ? parseInt(String(limit), 10) : 10,
        sortBy: sortBy ? String(sortBy) : "createdAt",
        sortOrder: sortOrder === "asc" ? "asc" : "desc",
      });
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  adminGetEnrollmentDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!this.adminGetEnrollmentDetailUseCase) {
        throw new Error("AdminGetEnrollmentDetailUseCase not initialized.");
      }
      const enrollmentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await this.adminGetEnrollmentDetailUseCase.execute(enrollmentId);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  teacherListEnrollments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!this.teacherGetEnrollmentsUseCase) {
        throw new Error("TeacherGetEnrollmentsUseCase not initialized.");
      }
      const teacherUserId = this.getUserId(req);
      const { search, status, courseId, paymentMethod, page, limit, sortBy, sortOrder } = req.query;
      const result = await this.teacherGetEnrollmentsUseCase.execute({
        teacherUserId,
        search: search ? String(search) : undefined,
        status: status ? (String(status) as any) : undefined,
        courseId: courseId ? String(courseId) : undefined,
        paymentMethod: paymentMethod ? String(paymentMethod) : undefined,
        page: page ? parseInt(String(page), 10) : 1,
        limit: limit ? parseInt(String(limit), 10) : 10,
        sortBy: sortBy ? String(sortBy) : "createdAt",
        sortOrder: sortOrder === "asc" ? "asc" : "desc",
      });
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  teacherGetEnrollmentDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!this.teacherGetEnrollmentDetailUseCase) {
        throw new Error("TeacherGetEnrollmentDetailUseCase not initialized.");
      }
      const teacherUserId = this.getUserId(req);
      const enrollmentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await this.teacherGetEnrollmentDetailUseCase.execute(teacherUserId, enrollmentId);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

