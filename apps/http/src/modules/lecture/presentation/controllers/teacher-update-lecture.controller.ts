import { Request, Response, NextFunction } from "express";
import { TeacherUpdateLectureUseCase } from "../../application/use-cases/teacher-update-lecture.usecase";
import { updateLectureBodySchema } from "../schemas/lecture.schema";
import {
  ITeacherProfileResolver,
  defaultTeacherProfileResolver,
} from "@/modules/course/domain/services/teacher-profile-resolver.service";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class TeacherUpdateLectureController {
  constructor(
    private readonly teacherUpdateLectureUseCase: TeacherUpdateLectureUseCase,
    private readonly profileResolver: ITeacherProfileResolver = defaultTeacherProfileResolver
  ) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required.");
      const validatedBody = updateLectureBodySchema.parse(req.body);
      const teacherProfileId = await this.profileResolver.getTeacherProfileIdByUserId(req.user.userId);
      const result = await this.teacherUpdateLectureUseCase.execute(
        teacherProfileId,
        req.params.id as string,
        validatedBody
      );
      return ApiResponse.success(res, result, "Lecture updated successfully.");
    } catch (error) {
      next(error);
    }
  };
}
