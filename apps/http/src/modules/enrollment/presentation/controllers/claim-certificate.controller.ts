import { Request, Response, NextFunction } from "express";
import { ClaimCertificateUseCase } from "../../application/use-cases/claim-certificate.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class ClaimCertificateController {
  constructor(private readonly claimCertificateUseCase: ClaimCertificateUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const studentId = req.user?.userId;
      if (!studentId) throw new UnauthorizedError("Authentication required.");

      const enrollmentId = Array.isArray(req.params.enrollmentId)
        ? req.params.enrollmentId[0]
        : req.params.enrollmentId;
      const result = await this.claimCertificateUseCase.execute(studentId, enrollmentId);
      return ApiResponse.created(res, result, "Course completion certificate unlocked!");
    } catch (error) {
      next(error);
    }
  };
}
