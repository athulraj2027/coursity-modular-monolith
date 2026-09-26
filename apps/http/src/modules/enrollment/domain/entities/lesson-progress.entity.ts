export interface LessonProgressEntity {
  id: string;
  enrollmentId: string;
  lessonId: string;
  isCompleted: boolean;
  completedAt: Date | null;
  attendedLive: boolean;
  attendedAt: Date | null;
  liveAttendanceMinutes: number;
  lastPositionSeconds: number;
  createdAt: Date;
  updatedAt: Date;

  // Joined lesson metadata
  lessonTitle?: string;
  lessonType?: string;
  scheduledAt?: Date | null;
  liveStatus?: string;
}
