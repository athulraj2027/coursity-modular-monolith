import { Request, Response, NextFunction } from "express";
import { TeacherGetLecturesUseCase } from "../../application/use-cases/teacher-get-lectures.usecase";
import { lectureQueryObjectSchema } from "../schemas/lecture.schema";
import {
  ITeacherProfileResolver,
  defaultTeacherProfileResolver,
} from "@/modules/course/domain/services/teacher-profile-resolver.service";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class TeacherGetLecturesController {
  constructor(
    private readonly teacherGetLecturesUseCase: TeacherGetLecturesUseCase,
    private readonly profileResolver: ITeacherProfileResolver = defaultTeacherProfileResolver
  ) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required.");
      const validatedQuery = lectureQueryObjectSchema.parse(req.query);
      const teacherProfileId = await this.profileResolver.getTeacherProfileIdByUserId(req.user.userId);
      const result = await this.teacherGetLecturesUseCase.execute(teacherProfileId, validatedQuery as any);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };
}
