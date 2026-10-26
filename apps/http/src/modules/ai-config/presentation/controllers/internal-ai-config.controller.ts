import { Request, Response, NextFunction } from "express";
import { GetPublishedInternalConfigUseCase } from "../../application/use-cases/get-published-internal-config.usecase";
import { ApiResponse } from "@/shared";

export class InternalAIConfigController {
  constructor(
    private readonly getPublishedConfig: GetPublishedInternalConfigUseCase
  ) {}

  getPublishedConfigHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const versionId = req.query.versionId as string | undefined;
      const config = await this.getPublishedConfig.execute(versionId);
      return ApiResponse.success(res, config);
    } catch (error) {
      next(error);
    }
  };
}
