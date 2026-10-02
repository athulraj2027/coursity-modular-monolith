export type SubmissionStatus = "NOT_DONE" | "SUBMITTED" | "RESUBMITTED";
export type HomeworkVerificationStatus = "PENDING" | "VERIFIED" | "REDO";

export interface HomeworkSubmissionEntity {
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
  reviewedAt: Date | null;
  reviewedByTeacherId: string | null;
  submittedAt: Date;
  isLate: boolean;
  attemptCount: number;
  createdAt: Date;
  updatedAt: Date;

  // Enriched student relation info
  studentName?: string;
  studentEmail?: string;
  studentAvatar?: string | null;
}

export interface HomeworkEntity {
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
  dueDate: Date | null;
  maxScore: number;
  lectureId: string;
  courseId: string;
  teacherProfileId: string;
  sortOrder: number;
  isPublished: boolean;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  // Enriched context
  lectureTitle?: string;
  courseTitle?: string;
  courseSlug?: string;
  teacherName?: string;
  teacherAvatar?: string | null;

  // Student specific submission status (when retrieved by enrolled student)
  mySubmission?: HomeworkSubmissionEntity | null;

  // Aggregated submission counts (when retrieved by instructor / admin)
  totalSubmissions?: number;
  verifiedCount?: number;
  redoCount?: number;
  pendingCount?: number;
  totalEnrolledCount?: number;
}
