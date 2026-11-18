import { Request, Response, NextFunction } from "express";
import { StudentGetLecturesUseCase } from "../../application/use-cases/student-get-lectures.usecase";
import { lectureQueryObjectSchema } from "../schemas/lecture.schema";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class StudentGetLecturesController {
  constructor(private readonly studentGetLecturesUseCase: StudentGetLecturesUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required.");
      const validatedQuery = lectureQueryObjectSchema.parse(req.query);
      const result = await this.studentGetLecturesUseCase.execute(req.user.userId, validatedQuery as any);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };
}
