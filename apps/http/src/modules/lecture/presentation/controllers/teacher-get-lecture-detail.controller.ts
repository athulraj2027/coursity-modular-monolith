import { Request, Response, NextFunction } from "express";
import { TeacherGetLectureDetailUseCase } from "../../application/use-cases/teacher-get-lecture-detail.usecase";
import { UnauthorizedError } from "@/app/errors";
import { profileRepository } from "@/modules/profile";
import { ApiResponse } from "@/shared";

export class TeacherGetLectureDetailController {
  constructor(private readonly teacherGetLectureDetailUseCase: TeacherGetLectureDetailUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required.");
      const teacherProfileId = await profileRepository.getOrCreateTeacherProfileId(req.user.userId);
      const lectureId = req.params.id as string;
      const result = await this.teacherGetLectureDetailUseCase.execute(teacherProfileId, lectureId);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };
}
