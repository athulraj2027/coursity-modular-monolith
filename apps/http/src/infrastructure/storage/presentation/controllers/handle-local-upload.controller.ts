import path from "path";
import fs from "fs";
import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class HandleLocalUploadController {
  execute = async (req: Request, res: Response, next: NextFunction) => {
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

      return ApiResponse.success(
        res,
        { key: cleanKey },
        "File uploaded successfully to local storage",
        undefined,
        200,
        { key: cleanKey }
      );
    } catch (error) {
      next(error);
    }
  };
}
