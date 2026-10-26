import { Request, Response, NextFunction } from "express";
import { GetStudentEnrollmentsUseCase } from "../../application/use-cases/get-student-enrollments.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class GetMyEnrollmentsController {
  constructor(private readonly getStudentEnrollmentsUseCase: GetStudentEnrollmentsUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const studentId = req.user?.userId;
      if (!studentId) throw new UnauthorizedError("Authentication required.");

      const status = req.query.status as any;
      const result = await this.getStudentEnrollmentsUseCase.execute(studentId, status);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };
}
