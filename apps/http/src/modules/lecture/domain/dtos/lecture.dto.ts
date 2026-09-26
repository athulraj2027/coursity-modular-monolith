import { LiveClassStatus } from "../entities/lecture.entity";

export interface CreateLectureDTO {
  courseId: string;
  moduleId?: string;
  title: string;
  description?: string | null;
  scheduledAt?: Date | string | null;
  durationSeconds?: number;
  sortOrder?: number;
}

export interface UpdateLectureDTO {
  title?: string;
  description?: string | null;
  scheduledAt?: Date | string | null;
  durationSeconds?: number;
  liveStatus?: LiveClassStatus;
  isLiveNow?: boolean;
  isPublished?: boolean;
  sortOrder?: number;
}

export interface LectureFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  courseId?: string;
  teacherProfileId?: string;
  status?: string;
  sort?: "startTime-asc" | "startTime-desc" | "created-desc" | "created-asc" | "title-asc";
}

export interface PaginatedLecturesResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
