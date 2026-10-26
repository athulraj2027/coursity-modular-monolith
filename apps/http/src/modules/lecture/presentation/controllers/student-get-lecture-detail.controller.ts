import { Request, Response, NextFunction } from "express";
import { StudentGetLectureDetailUseCase } from "../../application/use-cases/student-get-lecture-detail.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class StudentGetLectureDetailController {
  constructor(private readonly studentGetLectureDetailUseCase: StudentGetLectureDetailUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required.");
      const lectureId = req.params.id as string;
      const result = await this.studentGetLectureDetailUseCase.execute(req.user.userId, lectureId);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };
}
