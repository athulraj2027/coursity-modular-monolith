import { Request, Response, NextFunction } from "express";
import { GetPublishedInternalConfigUseCase } from "../../application/use-cases/get-published-internal-config.usecase";

export class InternalAIConfigController {
  constructor(
    private readonly getPublishedConfig: GetPublishedInternalConfigUseCase
  ) {}

  getPublishedConfigHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const versionId = req.query.versionId as string | undefined;
      const config = await this.getPublishedConfig.execute(versionId);
      res.status(200).json({
        success: true,
        data: config,
      });
    } catch (error) {
      next(error);
    }
  };
}
