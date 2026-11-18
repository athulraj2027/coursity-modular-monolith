import { Request, Response, NextFunction } from "express";
import { TeacherDeleteLectureUseCase } from "../../application/use-cases/teacher-delete-lecture.usecase";
import {
  ITeacherProfileResolver,
  defaultTeacherProfileResolver,
} from "@/modules/course/domain/services/teacher-profile-resolver.service";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class TeacherDeleteLectureController {
  constructor(
    private readonly teacherDeleteLectureUseCase: TeacherDeleteLectureUseCase,
    private readonly profileResolver: ITeacherProfileResolver = defaultTeacherProfileResolver
  ) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required.");
      const teacherProfileId = await this.profileResolver.getTeacherProfileIdByUserId(req.user.userId);
      const lectureId = req.params.id as string;
      await this.teacherDeleteLectureUseCase.execute(teacherProfileId, lectureId);
      return ApiResponse.success(res, undefined, "Lecture deleted successfully.");
    } catch (error) {
      next(error);
    }
  };
}
