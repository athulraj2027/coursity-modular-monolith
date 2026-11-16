import { S3StorageService } from "./infrastructure/services/s3-storage.service";
import { GetPresignedUrl } from "./application/use-cases/get-presigned-url.usecase";
import { DeleteFile } from "./application/use-cases/delete-file.usecase";
import { UploadController } from "./presentation/controllers/upload.controller";
import { UploadRoutes } from "./presentation/routes/upload.routes";
import { IStorageService, StorageService } from "./domain/contracts/storage-service.interface";

// 1. Instantiate Storage Service Singleton
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
    IStorageService,
    StorageService,
};

// Domain layer
export * from "./domain/contracts/storage-service.interface";
export * from "./domain/entities/storage.entity";
export * from "./domain/errors/storage.error";

// Application layer
export * from "./application/use-cases/get-presigned-url.usecase";
export * from "./application/use-cases/delete-file.usecase";

// Infrastructure layer
export * from "./infrastructure/config/s3.config";
export * from "./infrastructure/services/s3-storage.service";

// Presentation layer
export * from "./presentation/controllers";
export * from "./presentation/routes/upload.routes";
export * from "./presentation/validators/upload.validator";

export default uploadRouter;
