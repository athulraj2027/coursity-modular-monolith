import { Request, Response, NextFunction } from "express";
import { GetMySubmissionUseCase } from "../../application/use-cases/get-my-submission.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class GetMySubmissionController {
  constructor(private readonly getMySubmissionUseCase: GetMySubmissionUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      const homeworkId = req.params.id as string;
      const result = await this.getMySubmissionUseCase.execute({
        homeworkId,
        studentId: req.user.userId,
      });
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };
}
