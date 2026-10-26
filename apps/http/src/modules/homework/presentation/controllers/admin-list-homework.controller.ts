import { Request, Response, NextFunction } from "express";
import { AdminListHomeworkUseCase } from "../../application/use-cases/admin-list-homework.usecase";
import { ApiResponse } from "@/shared";

export class AdminListHomeworkController {
  constructor(private readonly adminListHomeworkUseCase: AdminListHomeworkUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const search = req.query.search as string | undefined;
      const courseId = req.query.courseId as string | undefined;
      const lectureId = req.query.lectureId as string | undefined;
      const teacherProfileId = req.query.teacherProfileId as string | undefined;

      const result = await this.adminListHomeworkUseCase.execute({
        page,
        limit,
        search,
        courseId,
        lectureId,
        teacherProfileId,
      });

      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };
}
