import { Request, Response, NextFunction } from "express";
import { TeacherDeleteLectureUseCase } from "../../application/use-cases/teacher-delete-lecture.usecase";
import { UnauthorizedError } from "@/app/errors";
import { profileRepository } from "@/modules/profile";
import { ApiResponse } from "@/shared";

export class TeacherDeleteLectureController {
  constructor(private readonly teacherDeleteLectureUseCase: TeacherDeleteLectureUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required.");
      const teacherProfileId = await profileRepository.getOrCreateTeacherProfileId(req.user.userId);
      const lectureId = req.params.id as string;
      await this.teacherDeleteLectureUseCase.execute(teacherProfileId, lectureId);
      return ApiResponse.success(res, undefined, "Lecture deleted successfully.");
    } catch (error) {
      next(error);
    }
  };
}
