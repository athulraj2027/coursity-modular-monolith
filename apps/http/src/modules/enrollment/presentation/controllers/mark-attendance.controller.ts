import { Request, Response, NextFunction } from "express";
import { MarkClassAttendanceUseCase } from "../../application/use-cases/mark-class-attendance.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class MarkAttendanceController {
  constructor(private readonly markAttendanceUseCase: MarkClassAttendanceUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const studentId = req.user?.userId;
      if (!studentId) throw new UnauthorizedError("Authentication required.");

      const enrollmentId = Array.isArray(req.params.enrollmentId)
        ? req.params.enrollmentId[0]
        : req.params.enrollmentId;
      const result = await this.markAttendanceUseCase.execute(studentId, {
        enrollmentId,
        ...req.body,
      });
      return ApiResponse.success(res, result, "Live class attendance recorded.");
    } catch (error) {
      next(error);
    }
  };
}
