import { CreateLectureDTO, UpdateLectureDTO } from "../dtos/lecture.dto";
import { LectureValidationError } from "../errors/lecture.errors";

export class LectureValidationPolicy {
  public static readonly MIN_TITLE_LENGTH = 2;
  public static readonly MAX_TITLE_LENGTH = 200;
  public static readonly DEFAULT_DURATION_SECONDS = 3600;
  public static readonly MIN_DURATION_SECONDS = 60;

  /**
   * Validates creation payload
   */
  static validateCreation(dto: CreateLectureDTO): void {
    if (!dto.courseId || !dto.courseId.trim()) {
      throw new LectureValidationError("Course ID is required to create a lecture.");
    }

    if (!dto.title || !dto.title.trim()) {
      throw new LectureValidationError("Lecture name/title is required.");
    }

    const trimmedTitle = dto.title.trim();
    if (trimmedTitle.length < this.MIN_TITLE_LENGTH) {
      throw new LectureValidationError(
        `Lecture title must be at least ${this.MIN_TITLE_LENGTH} characters.`
      );
    }

    if (trimmedTitle.length > this.MAX_TITLE_LENGTH) {
      throw new LectureValidationError(
        `Lecture title cannot exceed ${this.MAX_TITLE_LENGTH} characters.`
      );
    }

    if (dto.durationSeconds !== undefined && dto.durationSeconds !== null) {
      if (typeof dto.durationSeconds !== "number" || isNaN(dto.durationSeconds) || dto.durationSeconds < this.MIN_DURATION_SECONDS) {
        throw new LectureValidationError(
          `Duration must be at least ${this.MIN_DURATION_SECONDS} seconds.`
        );
      }
    }
  }

  /**
   * Validates update payload
   */
  static validateUpdate(dto: UpdateLectureDTO): void {
    if (dto.title !== undefined) {
      if (!dto.title || !dto.title.trim()) {
        throw new LectureValidationError("Lecture name cannot be empty.");
      }
      const trimmedTitle = dto.title.trim();
      if (trimmedTitle.length < this.MIN_TITLE_LENGTH) {
        throw new LectureValidationError(
          `Lecture title must be at least ${this.MIN_TITLE_LENGTH} characters.`
        );
      }
      if (trimmedTitle.length > this.MAX_TITLE_LENGTH) {
        throw new LectureValidationError(
          `Lecture title cannot exceed ${this.MAX_TITLE_LENGTH} characters.`
        );
      }
    }

    if (dto.durationSeconds !== undefined && dto.durationSeconds !== null) {
      if (typeof dto.durationSeconds !== "number" || isNaN(dto.durationSeconds) || dto.durationSeconds < this.MIN_DURATION_SECONDS) {
        throw new LectureValidationError(
          `Duration must be at least ${this.MIN_DURATION_SECONDS} seconds.`
        );
      }
    }
  }

  /**
   * Normalizes duration, falling back to 3600 seconds (1 hour)
   */
  static normalizeDuration(
    durationSeconds?: number | null,
    fallback: number = this.DEFAULT_DURATION_SECONDS
  ): number {
    if (
      durationSeconds === undefined ||
      durationSeconds === null ||
      isNaN(durationSeconds) ||
      durationSeconds < this.MIN_DURATION_SECONDS
    ) {
      return fallback;
    }
    return Math.floor(durationSeconds);
  }
}
