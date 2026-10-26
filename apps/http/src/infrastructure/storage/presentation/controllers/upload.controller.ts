import { Request, Response, NextFunction } from "express";
import { GetPresignedUrl } from "../../use-cases/get-presigned-url.usecase";
import { DeleteFile } from "../../use-cases/delete-file.usecase";

import { GetPresignedUrlController } from "./get-presigned-url.controller";
import { HandleLocalUploadController } from "./handle-local-upload.controller";
import { DeleteFileController } from "./delete-file.controller";

export class UploadController {
  private readonly getPresignedUrlController: GetPresignedUrlController;
  private readonly handleLocalUploadController: HandleLocalUploadController;
  private readonly deleteFileController: DeleteFileController;

  constructor(
    getPresignedUrlUseCase: GetPresignedUrl,
    deleteFileUseCase: DeleteFile
  ) {
    this.getPresignedUrlController = new GetPresignedUrlController(getPresignedUrlUseCase);
    this.handleLocalUploadController = new HandleLocalUploadController();
    this.deleteFileController = new DeleteFileController(deleteFileUseCase);
  }

  getPresignedUrl = (req: Request, res: Response, next: NextFunction) =>
    this.getPresignedUrlController.execute(req, res, next);

  handleLocalUpload = (req: Request, res: Response, next: NextFunction) =>
    this.handleLocalUploadController.execute(req, res, next);

  deleteFile = (req: Request, res: Response, next: NextFunction) =>
    this.deleteFileController.execute(req, res, next);
}
