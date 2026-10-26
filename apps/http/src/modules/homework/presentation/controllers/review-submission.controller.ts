import { Request, Response, NextFunction } from "express";
import { ReviewSubmissionUseCase } from "../../application/use-cases/review-submission.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class ReviewSubmissionController {
  constructor(private readonly reviewSubmissionUseCase: ReviewSubmissionUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      const submissionId = req.params.submissionId as string;
      const result = await this.reviewSubmissionUseCase.execute({
        submissionId,
        userId: req.user.userId,
        userRole: req.user.role,
        data: req.body,
      });
      return ApiResponse.success(
        res,
        result,
        `Submission marked as ${result.verificationStatus}`
      );
    } catch (error) {
      next(error);
    }
  };
}
