import { Request, Response, NextFunction } from "express";
import { TeacherGetLecturesUseCase } from "../../application/use-cases/teacher-get-lectures.usecase";
import { UnauthorizedError } from "@/app/errors";
import { profileRepository } from "@/modules/profile";
import { ApiResponse } from "@/shared";

export class TeacherGetLecturesController {
  constructor(private readonly teacherGetLecturesUseCase: TeacherGetLecturesUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required.");
      const teacherProfileId = await profileRepository.getOrCreateTeacherProfileId(req.user.userId);
      const result = await this.teacherGetLecturesUseCase.execute(teacherProfileId, req.query as any);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };
}
