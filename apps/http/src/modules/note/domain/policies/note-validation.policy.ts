import { CreateNoteDTO, UpdateNoteDTO } from "../dtos/note.dto";
import { NoteValidationError } from "../errors/note.errors";
import { NoteFilePolicy } from "./note-file.policy";

export class NoteValidationPolicy {
  public static readonly MIN_NAME_LENGTH = 1;
  public static readonly MAX_NAME_LENGTH = 200;
  public static readonly MAX_DESCRIPTION_LENGTH = 10000;

  /**
   * Validates creation input
   */
  static validateCreation(dto: CreateNoteDTO): { normalizedExtension: string | null } {
    if (!dto.name || !dto.name.trim()) {
      throw new NoteValidationError("Note name is required");
    }

    const trimmedName = dto.name.trim();
    if (trimmedName.length < this.MIN_NAME_LENGTH) {
      throw new NoteValidationError(`Note name must be at least ${this.MIN_NAME_LENGTH} character`);
    }

    if (trimmedName.length > this.MAX_NAME_LENGTH) {
      throw new NoteValidationError(`Note name cannot exceed ${this.MAX_NAME_LENGTH} characters`);
    }

    if (!dto.lectureId || !dto.lectureId.trim()) {
      throw new NoteValidationError("Lecture ID is required to associate note");
    }

    if (dto.description && dto.description.length > this.MAX_DESCRIPTION_LENGTH) {
      throw new NoteValidationError(
        `Note description cannot exceed ${this.MAX_DESCRIPTION_LENGTH} characters`
      );
    }

    return NoteFilePolicy.validateFile({
      fileUrl: dto.fileUrl,
      fileKey: dto.fileKey,
      fileExtension: dto.fileExtension,
      fileSizeBytes: dto.fileSizeBytes,
    });
  }

  /**
   * Validates update input
   */
  static validateUpdate(dto: UpdateNoteDTO): { normalizedExtension?: string | null } {
    if (dto.name !== undefined) {
      if (!dto.name || !dto.name.trim()) {
        throw new NoteValidationError("Note name cannot be empty");
      }
      const trimmedName = dto.name.trim();
      if (trimmedName.length > this.MAX_NAME_LENGTH) {
        throw new NoteValidationError(`Note name cannot exceed ${this.MAX_NAME_LENGTH} characters`);
      }
    }

    if (dto.description !== undefined && dto.description !== null) {
      if (dto.description.length > this.MAX_DESCRIPTION_LENGTH) {
        throw new NoteValidationError(
          `Note description cannot exceed ${this.MAX_DESCRIPTION_LENGTH} characters`
        );
      }
    }

    let normalizedExtension: string | null | undefined = undefined;
    if (dto.fileUrl !== undefined || dto.fileKey !== undefined) {
      if (dto.fileUrl !== undefined && !dto.fileUrl.trim()) {
        throw new NoteValidationError("File URL cannot be empty");
      }
      if (dto.fileKey !== undefined && !dto.fileKey.trim()) {
        throw new NoteValidationError("File storage key cannot be empty");
      }

      if (dto.fileUrl) {
        const fileCheck = NoteFilePolicy.validateFile({
          fileUrl: dto.fileUrl,
          fileKey: dto.fileKey || "existing_key",
          fileExtension: dto.fileExtension,
          fileSizeBytes: dto.fileSizeBytes,
        });
        normalizedExtension = fileCheck.normalizedExtension;
      }
    } else if (dto.fileExtension !== undefined && dto.fileExtension !== null) {
      const ext = NoteFilePolicy.extractExtension(null, dto.fileExtension);
      if (ext && !NoteFilePolicy.isAllowedExtension(ext)) {
        throw new NoteValidationError(`Unsupported file extension '.${ext}'`);
      }
      normalizedExtension = ext;
    }

    return { normalizedExtension };
  }
}
