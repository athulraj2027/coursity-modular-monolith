import path from "path";
import fs from "fs";
import { Request, Response, NextFunction } from "express";
import { GetPresignedUrl } from "../../use-cases/get-presigned-url.usecase";
import { DeleteFile } from "../../use-cases/delete-file.usecase";
import { STATUS_CODES } from "@/app/config/status";
import { UnauthorizedError, BadRequestError } from "@/app/errors";

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
                data: {
                    uploadUrl: result.uploadUrl,
                    fileUrl: result.fileUrl,
                    publicUrl: result.fileUrl,
                    key: result.key,
                    expiresIn: result.expiresIn,
                },
            });
        } catch (error) {
            next(error);
        }
    };

    handleLocalUpload = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const rawKey = req.query.key as string;
            if (!rawKey) {
                throw new BadRequestError("Query parameter 'key' is required for local upload");
            }

            const decodedKey = decodeURIComponent(rawKey);
            // Normalize path and prevent directory traversal, ensure forward slashes
            const cleanKey = path.normalize(decodedKey).replace(/^(\.\.[\/\\])+/, "").replace(/\\/g, "/");

            const uploadsDir = path.join(process.cwd(), "uploads");
            const targetPath = path.join(uploadsDir, cleanKey);

            // Security check: ensure targetPath is within uploadsDir
            if (!targetPath.startsWith(uploadsDir)) {
                throw new BadRequestError("Invalid upload path");
            }

            const dir = path.dirname(targetPath);
            if (!fs.existsSync(dir)) {
                await fs.promises.mkdir(dir, { recursive: true });
            }

            const buffer = Buffer.isBuffer(req.body)
                ? req.body
                : typeof req.body === "string"
                ? Buffer.from(req.body)
                : Buffer.from([]);

            await fs.promises.writeFile(targetPath, buffer);

            res.status(STATUS_CODES.OK).json({
                success: true,
                message: "File uploaded successfully to local storage",
                key: cleanKey,
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
