import { Request, Response, NextFunction } from "express";
import { GetHomeworkByLectureUseCase } from "../../application/use-cases/get-homework-by-lecture.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class GetHomeworkByLectureController {
  constructor(private readonly getHomeworkByLectureUseCase: GetHomeworkByLectureUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      const lectureId = req.params.lectureId as string;
      const result = await this.getHomeworkByLectureUseCase.execute({
        lectureId,
        userId: req.user.userId,
        userRole: req.user.role,
      });
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };
}
