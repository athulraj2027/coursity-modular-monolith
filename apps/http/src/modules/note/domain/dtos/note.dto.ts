export interface CreateNoteDTO {
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

export interface UpdateNoteDTO {
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
  sort?: string;
}

export interface PaginatedNotesResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
