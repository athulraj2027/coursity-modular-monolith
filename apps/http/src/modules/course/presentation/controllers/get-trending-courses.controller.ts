import { Request, Response, NextFunction } from "express";
import { GetCoursesUseCase } from "../../application/use-cases/get-courses.usecase";
import { ApiResponse } from "@/shared/utils/api-response";

export class GetTrendingCoursesController {
  constructor(private readonly getCoursesUseCase: GetCoursesUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 6;
      const courses = await this.getCoursesUseCase.getTrendingCourses(limit);
      return ApiResponse.success(res, courses);
    } catch (error) {
      next(error);
    }
  };
}
