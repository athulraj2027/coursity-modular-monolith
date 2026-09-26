export type LiveClassStatus = "SCHEDULED" | "LIVE_NOW" | "COMPLETED" | "CANCELLED";

export interface Lecture {
  id: string;
  moduleId: string;
  title: string;
  description: string | null;
  scheduledAt: string | null; // ISO DateTime string
  durationSeconds: number;
  sortOrder: number;
  liveStatus: LiveClassStatus;
  isLiveNow: boolean;
  isPublished: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;

  // Enriched relational attributes
  courseId?: string;
  courseTitle?: string;
  courseSlug?: string;
  courseThumbnail?: string | null;
  moduleTitle?: string;
  teacherId?: string;
  teacherName?: string;
  teacherAvatar?: string | null;
  attendedLive?: boolean;
  isCompleted?: boolean;
  enrolledStudentsCount?: number;
}

export interface CreateLecturePayload {
  courseId: string;
  moduleId?: string;
  title: string;
  description?: string | null;
  scheduledAt?: string | null;
  durationSeconds?: number;
  sortOrder?: number;
}

export interface UpdateLecturePayload {
  title?: string;
  description?: string | null;
  scheduledAt?: string | null;
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

export interface LecturesListResponse {
  items: Lecture[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
