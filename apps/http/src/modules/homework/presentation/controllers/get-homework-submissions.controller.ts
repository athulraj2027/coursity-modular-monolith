import { Request, Response, NextFunction } from "express";
import { GetHomeworkSubmissionsUseCase } from "../../application/use-cases/get-homework-submissions.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class GetHomeworkSubmissionsController {
  constructor(private readonly getHomeworkSubmissionsUseCase: GetHomeworkSubmissionsUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      const homeworkId = req.params.id as string;
      const result = await this.getHomeworkSubmissionsUseCase.execute({
        homeworkId,
        userId: req.user.userId,
        userRole: req.user.role,
      });
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };
}
