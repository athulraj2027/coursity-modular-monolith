import { CreateHomeworkDTO, UpdateHomeworkDTO } from "../dtos/homework.dto";
import { HomeworkValidationError } from "../errors/homework.errors";

export class HomeworkValidationPolicy {
  /**
   * Validates homework assignment creation payload
   */
  static validateCreation(data: CreateHomeworkDTO): void {
    if (!data.title || !data.title.trim()) {
      throw new HomeworkValidationError("Homework title is required");
    }

    if (data.title.trim().length > 200) {
      throw new HomeworkValidationError("Homework title cannot exceed 200 characters");
    }

    if (!data.lectureId || !data.lectureId.trim()) {
      throw new HomeworkValidationError("Lecture ID is required to associate homework");
    }

    // Must provide at least one task payload (text content, external link, attachment, or description)
    const hasDescription = Boolean(data.description && data.description.trim().length > 0);
    const hasTaskContent = Boolean(data.taskContent && data.taskContent.trim().length > 0);
    const hasTaskUrl = Boolean(data.taskUrl && data.taskUrl.trim().length > 0);
    const hasAttachment = Boolean(data.attachmentUrl && data.attachmentUrl.trim().length > 0);

    if (!hasDescription && !hasTaskContent && !hasTaskUrl && !hasAttachment) {
      throw new HomeworkValidationError(
        "Please provide instructions, text task, external link, or an attachment file for this homework"
      );
    }

    if (data.maxScore !== undefined && data.maxScore !== null) {
      if (typeof data.maxScore !== "number" || isNaN(data.maxScore) || data.maxScore < 0) {
        throw new HomeworkValidationError("Maximum score must be a non-negative integer");
      }
    }
  }

  /**
   * Validates homework assignment update payload
   */
  static validateUpdate(data: UpdateHomeworkDTO): void {
    if (data.title !== undefined) {
      if (!data.title || !data.title.trim()) {
        throw new HomeworkValidationError("Homework title cannot be empty");
      }
      if (data.title.trim().length > 200) {
        throw new HomeworkValidationError("Homework title cannot exceed 200 characters");
      }
    }

    if (data.maxScore !== undefined && data.maxScore !== null) {
      if (typeof data.maxScore !== "number" || isNaN(data.maxScore) || data.maxScore < 0) {
        throw new HomeworkValidationError("Maximum score must be a non-negative integer");
      }
    }
  }

  /**
   * Safely parses dueDate to Date or returns null
   */
  static parseDueDate(dueDate: Date | string | null | undefined): Date | null {
    if (!dueDate) return null;
    if (dueDate instanceof Date) {
      return isNaN(dueDate.getTime()) ? null : dueDate;
    }
    const parsed = new Date(dueDate);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  /**
   * Normalizes maximum score, defaulting to 100
   */
  static normalizeMaxScore(maxScore?: number | null, fallback = 100): number {
    if (maxScore === undefined || maxScore === null || isNaN(maxScore)) {
      return fallback;
    }
    return Math.max(0, Math.floor(maxScore));
  }
}
