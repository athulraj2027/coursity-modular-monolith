import { Request, Response, NextFunction } from "express";
import { GetCategoriesUseCase } from "../../application/use-cases/get-categories.usecase";
import { ApiResponse } from "@/shared";

export class GetCategoryTreeController {
  constructor(private readonly getCategoriesUseCase: GetCategoriesUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const treeData = await this.getCategoriesUseCase.getActiveTree();
      return ApiResponse.success(res, treeData);
    } catch (error) {
      next(error);
    }
  };
}
