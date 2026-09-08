import { Router } from "express";
import { UploadController } from "../controllers/upload.controller";
import { getPresignedUrlSchema, deleteFileSchema } from "../validators/upload.validator";
import validate from "@/app/middlewares/validate";

export class UploadRoutes {
    public readonly router: Router;

    constructor(private readonly uploadController: UploadController) {
        this.router = Router();
        this.initRoutes();
    }

    private initRoutes(): void {
        // Generate presigned PUT URL for client-side direct S3 upload
        this.router.post(
            "/presigned-url",
            validate(getPresignedUrlSchema),
            this.uploadController.getPresignedUrl
        );

        // Delete an S3 storage object
        this.router.delete(
            "/file",
            validate(deleteFileSchema),
            this.uploadController.deleteFile
        );
    }
}
