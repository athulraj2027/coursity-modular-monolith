import { Request, Response, NextFunction } from "express";
import { GetCoursesUseCase } from "../../application/use-cases/get-courses.usecase";
import { ApiResponse } from "@/shared/utils/api-response";

export class GetCourseBySlugController {
  constructor(private readonly getCoursesUseCase: GetCoursesUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : (req.params.slug as string);
      const course = await this.getCoursesUseCase.getCourseBySlug(slug);

      return ApiResponse.success(res, course);
    } catch (error) {
      next(error);
    }
  };
}
