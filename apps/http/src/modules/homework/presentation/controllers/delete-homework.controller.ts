import { Request, Response, NextFunction } from "express";
import { DeleteHomeworkUseCase } from "../../application/use-cases/delete-homework.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class DeleteHomeworkController {
  constructor(private readonly deleteHomeworkUseCase: DeleteHomeworkUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      const homeworkId = req.params.id as string;
      await this.deleteHomeworkUseCase.execute({
        homeworkId,
        userId: req.user.userId,
        userRole: req.user.role,
      });
      return ApiResponse.success(res, undefined, "Homework assignment deleted successfully");
    } catch (error) {
      next(error);
    }
  };
}
