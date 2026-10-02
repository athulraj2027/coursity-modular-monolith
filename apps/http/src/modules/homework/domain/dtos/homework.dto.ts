import { HomeworkVerificationStatus, SubmissionStatus } from "../entities/homework.entity";

export interface CreateHomeworkDTO {
  title: string;
  description?: string | null;
  taskContent?: string | null;
  taskUrl?: string | null;
  attachmentUrl?: string | null;
  attachmentKey?: string | null;
  attachmentName?: string | null;
  attachmentType?: string | null;
  attachmentSize?: number;
  dueDate?: Date | string | null;
  maxScore?: number;
  lectureId: string;
  sortOrder?: number;
}

export interface UpdateHomeworkDTO {
  title?: string;
  description?: string | null;
  taskContent?: string | null;
  taskUrl?: string | null;
  attachmentUrl?: string | null;
  attachmentKey?: string | null;
  attachmentName?: string | null;
  attachmentType?: string | null;
  attachmentSize?: number;
  dueDate?: Date | string | null;
  maxScore?: number;
  sortOrder?: number;
  isPublished?: boolean;
}

export interface SubmitHomeworkDTO {
  submissionText?: string | null;
  submissionUrl?: string | null;
  fileUrl?: string | null;
  fileKey?: string | null;
  fileName?: string | null;
  fileType?: string | null;
  fileSizeBytes?: number;
}

export interface ReviewSubmissionDTO {
  verificationStatus: "VERIFIED" | "REDO";
  feedback?: string | null;
  score?: number | null;
}

export interface HomeworkFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  courseId?: string;
  lectureId?: string;
  teacherProfileId?: string;
  verificationStatus?: HomeworkVerificationStatus;
  sort?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
