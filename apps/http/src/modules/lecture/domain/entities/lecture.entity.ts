export type LiveClassStatus = "SCHEDULED" | "LIVE_NOW" | "COMPLETED" | "CANCELLED";

export interface LectureEntity {
  id: string;
  moduleId: string;
  title: string;
  description: string | null;
  scheduledAt: Date | null;
  durationSeconds: number;
  sortOrder: number;
  liveStatus: LiveClassStatus;
  isLiveNow: boolean;
  isPublished: boolean;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

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
