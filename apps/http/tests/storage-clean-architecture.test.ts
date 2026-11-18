import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import {
    IStorageService,
    StorageService,
    S3StorageService,
    storageService,
    GetPresignedUrl,
    DeleteFile,
    InvalidFileTypeError,
    FileSizeExceededError,
    StorageUnauthorizedError,
    getStorageConfig,
    isS3Configured,
} from "../src/infrastructure/storage";

describe("Storage Clean Architecture & Contract Tests", () => {
    const testUploadsDir = path.join(process.cwd(), "test-uploads-scratch");

    beforeEach(() => {
        if (!fs.existsSync(testUploadsDir)) {
            fs.mkdirSync(testUploadsDir, { recursive: true });
        }
    });

    afterEach(() => {
        if (fs.existsSync(testUploadsDir)) {
            fs.rmSync(testUploadsDir, { recursive: true, force: true });
        }
    });

    describe("1. Layering & Contracts", () => {
        it("should export singleton instances conforming to IStorageService and StorageService", () => {
            assert.ok(storageService instanceof StorageService);
            assert.equal(typeof storageService.getPresignedPutUrl, "function");
            assert.equal(typeof storageService.deleteFile, "function");
            assert.equal(typeof storageService.uploadBuffer, "function");
            assert.equal(typeof storageService.getPublicUrl, "function");
        });

        it("should allow creating custom S3StorageService with injected StorageConfig", () => {
            const customService: IStorageService = new S3StorageService(null, {
                useLocalStorage: true,
                uploadsDir: testUploadsDir,
                backendBaseUrl: "http://localhost:8080",
            });
            assert.ok(customService instanceof StorageService);
        });

        it("should correctly identify local vs cloud configuration in isS3Configured", () => {
            const localConfig = getStorageConfig({ useLocalStorage: true });
            assert.equal(isS3Configured(localConfig), false);

            const s3Config = getStorageConfig({
                useLocalStorage: false,
                bucketName: "my-bucket",
                accessKeyId: "AKIA_REAL_KEY",
                secretAccessKey: "REAL_SECRET",
            });
            assert.equal(isS3Configured(s3Config), true);
        });
    });

    describe("2. S3StorageService Local Storage Operations", () => {
        it("should generate local upload URL when running in local storage mode", async () => {
            const service = new S3StorageService(null, {
                useLocalStorage: true,
                backendBaseUrl: "http://localhost:3000",
                uploadsDir: testUploadsDir,
            });

            const result = await service.getPresignedPutUrl({
                key: "avatars/user-1/profile.png",
                contentType: "image/png",
                fileSize: 1024,
            });

            assert.equal(result.key, "avatars/user-1/profile.png");
            assert.ok(result.uploadUrl.includes("/api/upload/local?key="));
            assert.equal(result.fileUrl, "http://localhost:3000/uploads/avatars/user-1/profile.png");
        });

        it("should upload buffer and delete file locally", async () => {
            const service = new S3StorageService(null, {
                useLocalStorage: true,
                backendBaseUrl: "http://localhost:3000",
                uploadsDir: testUploadsDir,
            });

            const testKey = "documents/user-1/notes.txt";
            const buffer = Buffer.from("Hello clean architecture storage");

            const publicUrl = await service.uploadBuffer({
                key: testKey,
                buffer,
                contentType: "text/plain",
            });

            assert.equal(publicUrl, `http://localhost:3000/uploads/${testKey}`);
            const savedPath = path.join(testUploadsDir, testKey);
            assert.ok(fs.existsSync(savedPath));
            assert.equal(fs.readFileSync(savedPath, "utf-8"), "Hello clean architecture storage");

            const deleteResult = await service.deleteFile(testKey);
            assert.equal(deleteResult, true);
            assert.equal(fs.existsSync(savedPath), false);
        });
    });

    describe("3. Application Use Case: GetPresignedUrl", () => {
        it("should successfully generate presigned URL for valid input", async () => {
            const service = new S3StorageService(null, {
                useLocalStorage: true,
                backendBaseUrl: "http://localhost:3000",
            });
            const useCase = new GetPresignedUrl(service);

            const result = await useCase.execute({
                fileName: "avatar.png",
                fileType: "image/png",
                folder: "avatars",
                fileSize: 2 * 1024 * 1024,
                userId: "user-42",
            });

            assert.ok(result.uploadUrl);
            assert.ok(result.key.startsWith("avatars/user-42/"));
            assert.ok(result.key.endsWith("-avatar.png"));
        });

        it("should throw InvalidFileTypeError for unsupported file extension", async () => {
            const service = new S3StorageService(null, { useLocalStorage: true });
            const useCase = new GetPresignedUrl(service);

            await assert.rejects(
                async () => {
                    await useCase.execute({
                        fileName: "malware.exe",
                        fileType: "application/x-msdownload",
                        userId: "user-42",
                    });
                },
                (err: any) => err instanceof InvalidFileTypeError
            );
        });

        it("should throw FileSizeExceededError when image exceeds 10MB", async () => {
            const service = new S3StorageService(null, { useLocalStorage: true });
            const useCase = new GetPresignedUrl(service);

            await assert.rejects(
                async () => {
                    await useCase.execute({
                        fileName: "huge.png",
                        fileType: "image/png",
                        fileSize: 15 * 1024 * 1024, // 15MB > 10MB limit
                        userId: "user-42",
                    });
                },
                (err: any) => err instanceof FileSizeExceededError
            );
        });
    });

    describe("4. Application Use Case: DeleteFile", () => {
        it("should allow owner to delete their file", async () => {
            const service = new S3StorageService(null, { useLocalStorage: true });
            const useCase = new DeleteFile(service);

            const result = await useCase.execute({
                key: "avatars/user-100/photo.jpg",
                userId: "user-100",
                userRole: "STUDENT",
            });

            assert.equal(result.success, true);
        });

        it("should allow admin to delete any user file", async () => {
            const service = new S3StorageService(null, { useLocalStorage: true });
            const useCase = new DeleteFile(service);

            const result = await useCase.execute({
                key: "avatars/user-100/photo.jpg",
                userId: "admin-999",
                userRole: "ADMIN",
            });

            assert.equal(result.success, true);
        });

        it("should forbid non-admin from deleting another user's file", async () => {
            const service = new S3StorageService(null, { useLocalStorage: true });
            const useCase = new DeleteFile(service);

            await assert.rejects(
                async () => {
                    await useCase.execute({
                        key: "avatars/user-100/photo.jpg",
                        userId: "user-200",
                        userRole: "STUDENT",
                    });
                },
                (err: any) => err instanceof StorageUnauthorizedError
            );
        });

        it("should forbid path traversal attempts in storage keys", async () => {
            const service = new S3StorageService(null, { useLocalStorage: true });
            const useCase = new DeleteFile(service);

            await assert.rejects(
                async () => {
                    await useCase.execute({
                        key: "avatars/../secrets/password.txt",
                        userId: "user-100",
                        userRole: "ADMIN",
                    });
                },
                (err: any) => err instanceof StorageUnauthorizedError
            );
        });
    });
});

