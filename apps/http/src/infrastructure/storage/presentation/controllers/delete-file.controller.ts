import { Request, Response, NextFunction } from "express";
import { DeleteFile } from "../../use-cases/delete-file.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class DeleteFileController {
  constructor(private readonly deleteFileUseCase: DeleteFile) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      const userRole = req.user?.role || "STUDENT";
      if (!userId) {
        throw new UnauthorizedError("Authentication required to delete file");
      }

      const { key, fileUrl } = req.body;

      const result = await this.deleteFileUseCase.execute({
        key,
        fileUrl,
        userId,
        userRole,
      });

      return ApiResponse.success(res, { success: result.success }, result.message);
    } catch (error) {
      next(error);
    }
  };
}
