import { Request, Response, NextFunction } from "express";
import { AdminGetEnrollmentDetailUseCase } from "../../application/use-cases/admin-get-enrollment-detail.usecase";
import { ApiResponse } from "@/shared";

export class AdminGetEnrollmentDetailController {
  constructor(private readonly adminGetEnrollmentDetailUseCase?: AdminGetEnrollmentDetailUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!this.adminGetEnrollmentDetailUseCase) {
        throw new Error("AdminGetEnrollmentDetailUseCase not initialized.");
      }
      const enrollmentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await this.adminGetEnrollmentDetailUseCase.execute(enrollmentId);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };
}
