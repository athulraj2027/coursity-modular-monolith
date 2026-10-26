import { Request, Response, NextFunction } from "express";
import { GetCoursesUseCase } from "../../application/use-cases/get-courses.usecase";
import { queryCoursesSchema } from "../validators/course.validator";
import { ApiResponse } from "@/shared/utils/api-response";

export class GetPublicCoursesController {
  constructor(private readonly getCoursesUseCase: GetCoursesUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = queryCoursesSchema.parse(req.query);
      const result = await this.getCoursesUseCase.getPublicCourses(query as any);

      return ApiResponse.success(res, result.items, "Success", {
        total: result.total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(result.total / query.limit),
      });
    } catch (error) {
      next(error);
    }
  };
}
