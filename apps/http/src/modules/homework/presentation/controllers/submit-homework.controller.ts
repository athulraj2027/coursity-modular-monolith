import { Request, Response, NextFunction } from "express";
import { SubmitHomeworkUseCase } from "../../application/use-cases/submit-homework.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class SubmitHomeworkController {
  constructor(private readonly submitHomeworkUseCase: SubmitHomeworkUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      const homeworkId = req.params.id as string;
      const result = await this.submitHomeworkUseCase.execute({
        homeworkId,
        studentId: req.user.userId,
        userRole: req.user.role,
        data: req.body,
      });
      return ApiResponse.success(res, result, "Homework submitted successfully");
    } catch (error) {
      next(error);
    }
  };
}
