import { Request, Response, NextFunction } from "express";
import { EnrollFreeCourseUseCase } from "../../application/use-cases/enroll-free-course.usecase";
import { enrollFreeCourseSchema } from "../schemas/enrollment.schema";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class EnrollFreeController {
  constructor(private readonly enrollFreeUseCase: EnrollFreeCourseUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const studentId = req.user?.userId;
      if (!studentId) throw new UnauthorizedError("Authentication required.");

      const validated = enrollFreeCourseSchema.parse(req.body);
      const result = await this.enrollFreeUseCase.execute(studentId, validated.courseId);
      return ApiResponse.created(res, result, "Successfully enrolled in free course.");
    } catch (error) {
      next(error);
    }
  };
}
