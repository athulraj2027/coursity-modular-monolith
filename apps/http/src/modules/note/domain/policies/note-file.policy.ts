import { NoteValidationError } from "../errors/note.errors";

export class NoteFilePolicy {
  public static readonly ALLOWED_EXTENSIONS = new Set([
    "pdf",
    "ppt",
    "pptx",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "txt",
    "zip",
    "rar",
    "csv",
    "epub",
  ]);

  public static readonly MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

  /**
   * Extracts clean file extension from a file URL or provided extension
   */
  static extractExtension(
    fileUrl?: string | null,
    providedExtension?: string | null
  ): string | null {
    if (providedExtension && providedExtension.trim()) {
      return providedExtension.trim().toLowerCase().replace(/^\./, "");
    }

    if (!fileUrl) return null;

    try {
      // Remove query parameters and hash fragments
      const cleanUrl = fileUrl.split(/[?#]/)[0];
      const parts = cleanUrl.split("/");
      const filename = parts.pop() || "";
      const dotIndex = filename.lastIndexOf(".");
      if (dotIndex > 0 && dotIndex < filename.length - 1) {
        return filename.substring(dotIndex + 1).toLowerCase();
      }
    } catch {
      // Fallback
    }

    return null;
  }

  /**
   * Checks whether the file extension is supported
   */
  static isAllowedExtension(extension: string): boolean {
    const clean = extension.toLowerCase().replace(/^\./, "");
    return this.ALLOWED_EXTENSIONS.has(clean);
  }

  /**
   * Validates file metadata and constraints
   */
  static validateFile(params: {
    fileUrl: string;
    fileKey: string;
    fileExtension?: string | null;
    fileSizeBytes?: number;
  }): { normalizedExtension: string | null } {
    const { fileUrl, fileKey, fileExtension, fileSizeBytes } = params;

    if (!fileUrl || !fileUrl.trim()) {
      throw new NoteValidationError("File URL is required");
    }

    if (!fileKey || !fileKey.trim()) {
      throw new NoteValidationError("File storage key is required");
    }

    if (fileSizeBytes !== undefined && fileSizeBytes !== null) {
      if (fileSizeBytes < 0) {
        throw new NoteValidationError("File size cannot be negative");
      }
      if (fileSizeBytes > this.MAX_FILE_SIZE_BYTES) {
        throw new NoteValidationError(
          `File size exceeds maximum permitted limit (${Math.round(this.MAX_FILE_SIZE_BYTES / (1024 * 1024))}MB)`
        );
      }
    }

    const normalized = this.extractExtension(fileUrl, fileExtension);
    if (normalized && !this.isAllowedExtension(normalized)) {
      throw new NoteValidationError(
        `Unsupported file extension '.${normalized}'. Allowed extensions: ${Array.from(this.ALLOWED_EXTENSIONS).join(", ")}`
      );
    }

    return { normalizedExtension: normalized };
  }
}
