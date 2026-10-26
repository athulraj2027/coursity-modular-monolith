import { Request, Response, NextFunction } from "express";
import { TeacherGetEnrollmentDetailUseCase } from "../../application/use-cases/teacher-get-enrollment-detail.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class TeacherGetEnrollmentDetailController {
  constructor(private readonly teacherGetEnrollmentDetailUseCase?: TeacherGetEnrollmentDetailUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!this.teacherGetEnrollmentDetailUseCase) {
        throw new Error("TeacherGetEnrollmentDetailUseCase not initialized.");
      }
      const teacherUserId = req.user?.userId;
      if (!teacherUserId) throw new UnauthorizedError("Authentication required.");

      const enrollmentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await this.teacherGetEnrollmentDetailUseCase.execute(teacherUserId, enrollmentId);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };
}
