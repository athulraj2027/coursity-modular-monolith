import { Request, Response, NextFunction } from "express";
import { GetPresignedUrl } from "../../application/use-cases/get-presigned-url.usecase";
import { DeleteFile } from "../../application/use-cases/delete-file.usecase";
import { STATUS_CODES } from "@/app/config/status";
import { UnauthorizedError } from "@/app/errors";

export class UploadController {
    constructor(
        private readonly getPresignedUrlUseCase: GetPresignedUrl,
        private readonly deleteFileUseCase: DeleteFile
    ) { }

    getPresignedUrl = async (req: Request, res: Response, next: NextFunction) => {
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

            res.status(STATUS_CODES.OK).json({
                message: "Presigned upload URL generated successfully",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    deleteFile = async (req: Request, res: Response, next: NextFunction) => {
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

            res.status(STATUS_CODES.OK).json({
                message: result.message,
                data: { success: result.success },
            });
        } catch (error) {
            next(error);
        }
    };
}
