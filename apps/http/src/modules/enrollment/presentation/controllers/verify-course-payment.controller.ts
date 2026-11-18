import { Request, Response, NextFunction } from "express";
import { VerifyCoursePaymentUseCase } from "../../application/use-cases/verify-course-payment.usecase";
import { verifyCoursePaymentSchema } from "../schemas/enrollment.schema";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class VerifyCoursePaymentController {
  constructor(private readonly verifyPaymentUseCase: VerifyCoursePaymentUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const studentId = req.user?.userId;
      if (!studentId) throw new UnauthorizedError("Authentication required.");

      const validated = verifyCoursePaymentSchema.parse(req.body);
      const result = await this.verifyPaymentUseCase.execute(studentId, validated);
      return ApiResponse.created(res, result, "Payment verified and course enrollment confirmed.");
    } catch (error) {
      next(error);
    }
  };
}
