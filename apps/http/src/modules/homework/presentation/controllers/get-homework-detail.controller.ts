import { Request, Response, NextFunction } from "express";
import { GetHomeworkDetailUseCase } from "../../application/use-cases/get-homework-detail.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class GetHomeworkDetailController {
  constructor(private readonly getHomeworkDetailUseCase: GetHomeworkDetailUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      const homeworkId = req.params.id as string;
      const result = await this.getHomeworkDetailUseCase.execute({
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
