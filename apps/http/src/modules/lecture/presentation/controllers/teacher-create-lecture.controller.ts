import { Request, Response, NextFunction } from "express";
import { TeacherCreateLectureUseCase } from "../../application/use-cases/teacher-create-lecture.usecase";
import { UnauthorizedError } from "@/app/errors";
import { profileRepository } from "@/modules/profile";
import { ApiResponse } from "@/shared";

export class TeacherCreateLectureController {
  constructor(private readonly teacherCreateLectureUseCase: TeacherCreateLectureUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required.");
      const teacherProfileId = await profileRepository.getOrCreateTeacherProfileId(req.user.userId);
      const result = await this.teacherCreateLectureUseCase.execute(teacherProfileId, req.body);
      return ApiResponse.created(res, result, "Lecture created successfully.");
    } catch (error) {
      next(error);
    }
  };
}
