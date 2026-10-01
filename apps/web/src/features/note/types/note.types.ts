export interface Note {
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
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;

  // Contextual relations
  lectureTitle?: string;
  courseTitle?: string;
  courseSlug?: string;
  teacherName?: string;
  teacherAvatar?: string | null;
}

export interface CreateNotePayload {
  name: string;
  description?: string | null;
  fileUrl: string;
  fileKey: string;
  fileType: string;
  fileExtension?: string | null;
  fileSizeBytes?: number;
  lectureId: string;
  sortOrder?: number;
}

export interface UpdateNotePayload {
  name?: string;
  description?: string | null;
  fileUrl?: string;
  fileKey?: string;
  fileType?: string;
  fileExtension?: string | null;
  fileSizeBytes?: number;
  sortOrder?: number;
  isPublished?: boolean;
}

export interface NoteFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  courseId?: string;
  lectureId?: string;
  teacherProfileId?: string;
  fileExtension?: string;
  sort?: "created-desc" | "created-asc" | "name-asc" | "name-desc";
}

export interface NotesListResponse {
  items: Note[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
