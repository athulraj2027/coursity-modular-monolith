import { Request, Response, NextFunction } from "express";
import { GetCategoriesUseCase } from "../../application/use-cases/get-categories.usecase";
import { NotFoundError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class GetCategoryBySlugController {
  constructor(private readonly getCategoriesUseCase: GetCategoriesUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : (req.params.slug as string);
      const category = await this.getCategoriesUseCase.getBySlug(slug);
      if (!category) {
        throw new NotFoundError(`Category with slug '${slug}' was not found.`);
      }

      return ApiResponse.success(res, category);
    } catch (error) {
      next(error);
    }
  };
}
