export interface NoteEntity {
  id: string;
  name: string;
  description: string | null;
  fileUrl: string;
  fileKey: string;
  fileType: string;
  fileExtension: string | null;
  fileSizeBytes: number;
  lectureId: string;
  courseId: string;
  teacherProfileId: string;
  sortOrder: number;
  isPublished: boolean;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  // Enriched contextual relation attributes
  lectureTitle?: string;
  courseTitle?: string;
  courseSlug?: string;
  teacherName?: string;
  teacherAvatar?: string | null;
}
