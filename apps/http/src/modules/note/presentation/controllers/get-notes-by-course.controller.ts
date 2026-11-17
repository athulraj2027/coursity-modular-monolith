import { Request, Response, NextFunction } from "express";
import { GetNotesByCourseUseCase } from "../../application/use-cases/get-notes-by-course.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";
import {
  ITeacherProfileResolver,
  defaultTeacherProfileResolver,
} from "@/modules/course/domain/services/teacher-profile-resolver.service";

export class GetNotesByCourseController {
  constructor(
    private readonly getNotesByCourseUseCase: GetNotesByCourseUseCase,
    private readonly profileResolver: ITeacherProfileResolver = defaultTeacherProfileResolver
  ) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");

      const courseId = req.params.courseId as string;

      let teacherProfileId: string | null = null;
      if (req.user.role === "TEACHER") {
        teacherProfileId = await this.profileResolver.getTeacherProfileIdByUserId(req.user.userId);
      }

      const result = await this.getNotesByCourseUseCase.execute({
        courseId,
        userId: req.user.userId,
        userRole: req.user.role,
        teacherProfileId,
      });

      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };
}
