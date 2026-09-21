import { S3StorageService } from "./services/s3-storage.service";
import { GetPresignedUrl } from "./use-cases/get-presigned-url.usecase";
import { DeleteFile } from "./use-cases/delete-file.usecase";
import { UploadController } from "./presentation/controllers/upload.controller";
import { UploadRoutes } from "./presentation/routes/upload.routes";
import { IStorageService } from "./contracts/storage-service.abstract";

// 1. Instantiate Storage Service Singleton implementing IStorageService abstract class
const storageService: IStorageService = new S3StorageService();

// 2. Application Use Cases
const getPresignedUrlUseCase = new GetPresignedUrl(storageService);
const deleteFileUseCase = new DeleteFile(storageService);

// 3. Presentation Controllers
const uploadController = new UploadController(getPresignedUrlUseCase, deleteFileUseCase);

// 4. Routes
const uploadRoutes = new UploadRoutes(uploadController);
export const uploadRouter = uploadRoutes.router;

// 5. Exports
export {
    storageService,
    getPresignedUrlUseCase,
    deleteFileUseCase,
    uploadController,
    UploadController,
    UploadRoutes,
    S3StorageService,
};

export * from "./contracts/storage-service.abstract";
export * from "./entities/storage.entity";
export * from "./errors/storage.error";
export * from "./config/s3.config";
export * from "./use-cases/get-presigned-url.usecase";
export * from "./use-cases/delete-file.usecase";
export * from "./presentation/controllers/upload.controller";
export * from "./presentation/routes/upload.routes";
export * from "./presentation/validators/upload.validator";

export default uploadRouter;
