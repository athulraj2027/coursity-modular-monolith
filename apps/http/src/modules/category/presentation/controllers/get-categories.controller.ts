import { Request, Response, NextFunction } from "express";
import { GetCategoriesUseCase } from "../../application/use-cases/get-categories.usecase";
import { ApiResponse } from "@/shared";

export class GetCategoriesController {
  constructor(private readonly getCategoriesUseCase: GetCategoriesUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tree = req.query.format === "tree" || req.query.tree === "true";
      if (tree) {
        const treeData = await this.getCategoriesUseCase.getActiveTree();
        return ApiResponse.success(res, treeData);
      }

      const flatData = await this.getCategoriesUseCase.getAllActive();
      return ApiResponse.success(res, flatData);
    } catch (error) {
      next(error);
    }
  };
}
