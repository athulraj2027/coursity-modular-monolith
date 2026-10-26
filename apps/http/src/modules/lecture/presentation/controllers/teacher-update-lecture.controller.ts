import { Request, Response, NextFunction } from "express";
import { TeacherUpdateLectureUseCase } from "../../application/use-cases/teacher-update-lecture.usecase";
import { UnauthorizedError } from "@/app/errors";
import { profileRepository } from "@/modules/profile";
import { ApiResponse } from "@/shared";

export class TeacherUpdateLectureController {
  constructor(private readonly teacherUpdateLectureUseCase: TeacherUpdateLectureUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required.");
      const teacherProfileId = await profileRepository.getOrCreateTeacherProfileId(req.user.userId);
      const lectureId = req.params.id as string;
      const result = await this.teacherUpdateLectureUseCase.execute(teacherProfileId, lectureId, req.body);
      return ApiResponse.success(res, result, "Lecture updated successfully.");
    } catch (error) {
      next(error);
    }
  };
}
