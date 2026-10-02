export type SubmissionStatus = "NOT_DONE" | "SUBMITTED" | "RESUBMITTED";
export type HomeworkVerificationStatus = "PENDING" | "VERIFIED" | "REDO";

export interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  studentId: string;
  submissionText: string | null;
  submissionUrl: string | null;
  fileUrl: string | null;
  fileKey: string | null;
  fileName: string | null;
  fileType: string | null;
  fileSizeBytes: number;
  status: SubmissionStatus;
  verificationStatus: HomeworkVerificationStatus;
  feedback: string | null;
  score: number | null;
  reviewedAt: string | null;
  reviewedByTeacherId: string | null;
  submittedAt: string;
  isLate: boolean;
  attemptCount: number;
  createdAt: string;
  updatedAt: string;

  // Relation context
  studentName?: string;
  studentEmail?: string;
  studentAvatar?: string | null;
}

export interface Homework {
  id: string;
  title: string;
  description: string | null;
  taskContent: string | null;
  taskUrl: string | null;
  attachmentUrl: string | null;
  attachmentKey: string | null;
  attachmentName: string | null;
  attachmentType: string | null;
  attachmentSize: number;
  dueDate: string | null;
  maxScore: number;
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

  // Student specific submission status (when fetched as student)
  mySubmission?: HomeworkSubmission | null;

  // Aggregated submission counts (when fetched as instructor / admin)
  totalSubmissions?: number;
  verifiedCount?: number;
  redoCount?: number;
  pendingCount?: number;
  totalEnrolledCount?: number;
}

export interface CreateHomeworkPayload {
  title: string;
  description?: string | null;
  taskContent?: string | null;
  taskUrl?: string | null;
  attachmentUrl?: string | null;
  attachmentKey?: string | null;
  attachmentName?: string | null;
  attachmentType?: string | null;
  attachmentSize?: number;
  dueDate?: string | null;
  maxScore?: number;
  lectureId: string;
  sortOrder?: number;
}

export interface UpdateHomeworkPayload {
  title?: string;
  description?: string | null;
  taskContent?: string | null;
  taskUrl?: string | null;
  attachmentUrl?: string | null;
  attachmentKey?: string | null;
  attachmentName?: string | null;
  attachmentType?: string | null;
  attachmentSize?: number;
  dueDate?: string | null;
  maxScore?: number;
  sortOrder?: number;
  isPublished?: boolean;
}

export interface SubmitHomeworkPayload {
  submissionText?: string | null;
  submissionUrl?: string | null;
  fileUrl?: string | null;
  fileKey?: string | null;
  fileName?: string | null;
  fileType?: string | null;
  fileSizeBytes?: number;
}

export interface ReviewSubmissionPayload {
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
  sort?: "created-desc" | "created-asc" | "title-asc" | "title-desc" | "due-asc" | "due-desc";
}

export interface HomeworkListResponse {
  items: Homework[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface HomeworkSubmissionsListResponse {
  homeworkTitle: string;
  courseTitle?: string;
  maxScore: number;
  submissions: HomeworkSubmission[];
}
