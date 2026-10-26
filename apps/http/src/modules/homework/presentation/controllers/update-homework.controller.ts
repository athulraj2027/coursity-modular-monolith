import { Request, Response, NextFunction } from "express";
import { UpdateHomeworkUseCase } from "../../application/use-cases/update-homework.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class UpdateHomeworkController {
  constructor(private readonly updateHomeworkUseCase: UpdateHomeworkUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      const homeworkId = req.params.id as string;
      const result = await this.updateHomeworkUseCase.execute({
        homeworkId,
        userId: req.user.userId,
        userRole: req.user.role,
        data: req.body,
      });
      return ApiResponse.success(res, result, "Homework updated successfully");
    } catch (error) {
      next(error);
    }
  };
}
