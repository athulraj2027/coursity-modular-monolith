import { Request, Response, NextFunction } from "express";
import { AdminListHomeworkUseCase } from "../../application/use-cases/admin-list-homework.usecase";
import { homeworkQueryObjectSchema } from "../schemas/homework.schema";
import { ApiResponse } from "@/shared";

export class AdminListHomeworkController {
  constructor(private readonly adminListHomeworkUseCase: AdminListHomeworkUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedQuery = homeworkQueryObjectSchema.parse(req.query);

      const result = await this.adminListHomeworkUseCase.execute({
        page: validatedQuery.page ?? 1,
        limit: validatedQuery.limit ?? 10,
        search: validatedQuery.search,
        courseId: validatedQuery.courseId,
        lectureId: validatedQuery.lectureId,
        teacherProfileId: validatedQuery.teacherProfileId,
        sort: validatedQuery.sort,
      });

      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };
}
