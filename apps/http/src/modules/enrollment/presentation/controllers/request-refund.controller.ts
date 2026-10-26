import { Request, Response, NextFunction } from "express";
import { RequestCourseRefundUseCase } from "../../application/use-cases/request-course-refund.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class RequestRefundController {
  constructor(private readonly requestRefundUseCase: RequestCourseRefundUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const studentId = req.user?.userId;
      if (!studentId) throw new UnauthorizedError("Authentication required.");

      const enrollmentId = Array.isArray(req.params.enrollmentId)
        ? req.params.enrollmentId[0]
        : req.params.enrollmentId;
      const result = await this.requestRefundUseCase.execute(studentId, {
        enrollmentId,
        ...req.body,
      });
      return ApiResponse.success(
        res,
        result,
        "100% Full refund processed successfully under 20-Day / 4-Classes guarantee."
      );
    } catch (error) {
      next(error);
    }
  };
}
