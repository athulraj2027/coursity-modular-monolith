import { Request, Response, NextFunction } from "express";
import { GetNotesByLectureUseCase } from "../../application/use-cases/get-notes-by-lecture.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";
import {
  ITeacherProfileResolver,
  defaultTeacherProfileResolver,
} from "@/modules/course/domain/services/teacher-profile-resolver.service";

export class GetNotesByLectureController {
  constructor(
    private readonly getNotesByLectureUseCase: GetNotesByLectureUseCase,
    private readonly profileResolver: ITeacherProfileResolver = defaultTeacherProfileResolver
  ) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");

      const lectureId = req.params.lectureId as string;

      let teacherProfileId: string | null = null;
      if (req.user.role === "TEACHER") {
        teacherProfileId = await this.profileResolver.getTeacherProfileIdByUserId(req.user.userId);
      }

      const result = await this.getNotesByLectureUseCase.execute({
        lectureId,
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
