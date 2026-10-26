import { Request, Response, NextFunction } from "express";
import { GetPresignedUrl } from "../../use-cases/get-presigned-url.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class GetPresignedUrlController {
  constructor(private readonly getPresignedUrlUseCase: GetPresignedUrl) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError("Authentication required to generate upload URL");
      }

      const { fileName, fileType, folder, fileSize } = req.body;

      const result = await this.getPresignedUrlUseCase.execute({
        fileName,
        fileType,
        folder,
        fileSize,
        userId,
      });

      return ApiResponse.success(
        res,
        {
          uploadUrl: result.uploadUrl,
          fileUrl: result.fileUrl,
          publicUrl: result.fileUrl,
          key: result.key,
          expiresIn: result.expiresIn,
        },
        "Presigned upload URL generated successfully"
      );
    } catch (error) {
      next(error);
    }
  };
}
