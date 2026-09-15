import express, { Router, RequestHandler } from "express";
import { UploadController } from "../controllers/upload.controller";
import { getPresignedUrlSchema, deleteFileSchema } from "../validators/upload.validator";
import validate from "@/app/middlewares/validate";
import { authMiddleware as defaultAuth } from "@/app/middlewares/auth.middleware";
import { isBlockedMiddleware as defaultIsBlocked } from "@/app/middlewares/is-blocked.middleware";

export class UploadRoutes {
    public readonly router: Router;

    constructor(
        private readonly uploadController: UploadController,
        authMiddleware: RequestHandler = defaultAuth,
        isBlockedMiddleware: RequestHandler = defaultIsBlocked
    ) {
        this.router = Router();
        this.initRoutes(authMiddleware, isBlockedMiddleware);
    }

    private initRoutes(auth: RequestHandler, isBlocked: RequestHandler): void {
        // 1. Generate presigned PUT URL for client-side direct upload (Protected)
        this.router.post(
            "/presigned-url",
            auth,
            isBlocked,
            validate(getPresignedUrlSchema),
            this.uploadController.getPresignedUrl
        );

        // 2. Direct binary local upload endpoint (handles PUT from client when S3 is unconfigured)
        this.router.put(
            "/local",
            express.raw({ type: "*/*", limit: "50mb" }),
            this.uploadController.handleLocalUpload
        );

        // 3. Delete a storage object (Protected)
        this.router.delete(
            "/file",
            auth,
            isBlocked,
            validate(deleteFileSchema),
            this.uploadController.deleteFile
        );
    }
}
