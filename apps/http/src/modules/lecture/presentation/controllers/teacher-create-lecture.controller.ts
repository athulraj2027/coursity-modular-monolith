import { Request, Response, NextFunction } from "express";
import { TeacherCreateLectureUseCase } from "../../application/use-cases/teacher-create-lecture.usecase";
import { createLectureBodySchema } from "../schemas/lecture.schema";
import {
  ITeacherProfileResolver,
  defaultTeacherProfileResolver,
} from "@/modules/course/domain/services/teacher-profile-resolver.service";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class TeacherCreateLectureController {
  constructor(
    private readonly teacherCreateLectureUseCase: TeacherCreateLectureUseCase,
    private readonly profileResolver: ITeacherProfileResolver = defaultTeacherProfileResolver
  ) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required.");
      const validatedBody = createLectureBodySchema.parse(req.body);
      const teacherProfileId = await this.profileResolver.getTeacherProfileIdByUserId(req.user.userId);
      const result = await this.teacherCreateLectureUseCase.execute(teacherProfileId, validatedBody);
      return ApiResponse.created(res, result, "Lecture created successfully.");
    } catch (error) {
      next(error);
    }
  };
}
