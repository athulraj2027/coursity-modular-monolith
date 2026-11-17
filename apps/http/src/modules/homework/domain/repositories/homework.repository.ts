import { HomeworkEntity, HomeworkSubmissionEntity } from "../entities/homework.entity";
import {
  CreateHomeworkDTO,
  UpdateHomeworkDTO,
  SubmitHomeworkDTO,
  ReviewSubmissionDTO,
  HomeworkFilterParams,
  PaginatedResult,
} from "../dtos/homework.dto";

export interface LectureCourseContext {
  id: string;
  title: string;
  courseId: string;
  courseTitle: string;
  teacherProfileId: string;
}

/**
 * Segregated query repository for reading homework assignments
 */
export interface IHomeworkQueryRepository {
  findById(id: string, includeDeleted?: boolean): Promise<HomeworkEntity | null>;
  findByLectureId(lectureId: string, studentId?: string, includeDeleted?: boolean): Promise<HomeworkEntity[]>;
  findByCourseId(courseId: string, studentId?: string, includeDeleted?: boolean): Promise<HomeworkEntity[]>;
  findLectureWithCourse(lectureId: string): Promise<LectureCourseContext | null>;
}

/**
 * Segregated repository for teacher/admin assignment authoring and lifecycle
 */
export interface IHomeworkManagementRepository {
  create(courseId: string, teacherProfileId: string, data: CreateHomeworkDTO): Promise<HomeworkEntity>;
  update(id: string, data: UpdateHomeworkDTO): Promise<HomeworkEntity>;
  softDelete(id: string): Promise<boolean>;
}

/**
 * Segregated repository for student submissions
 */
export interface IHomeworkSubmissionRepository {
  findSubmission(homeworkId: string, studentId: string): Promise<HomeworkSubmissionEntity | null>;
  findSubmissionById(submissionId: string): Promise<HomeworkSubmissionEntity | null>;
  findSubmissionsByHomeworkId(homeworkId: string): Promise<HomeworkSubmissionEntity[]>;
  createOrUpdateSubmission(
    homeworkId: string,
    studentId: string,
    data: SubmitHomeworkDTO,
    isLate: boolean
  ): Promise<HomeworkSubmissionEntity>;
}

/**
 * Segregated repository for teacher submission evaluation and grading
 */
export interface IHomeworkReviewRepository {
  reviewSubmission(
    submissionId: string,
    reviewedByTeacherId: string,
    data: ReviewSubmissionDTO
  ): Promise<HomeworkSubmissionEntity>;
}

/**
 * Segregated repository for administrative listing and monitoring
 */
export interface IAdminHomeworkRepository {
  findManyAdmin(params: HomeworkFilterParams): Promise<PaginatedResult<HomeworkEntity>>;
}

/**
 * Segregated repository for security context lookups (enrollment verification, profile resolution)
 */
export interface IHomeworkContextRepository {
  isStudentEnrolled(studentId: string, courseId: string): Promise<boolean>;
  getTeacherProfileIdByUserId(userId: string): Promise<string | null>;
  getCourseTeacherProfileId(courseId: string): Promise<string | null>;
}

/**
 * Unified Homework Repository Interface (ISP Aggregator)
 */
export interface IHomeworkRepository
  extends IHomeworkQueryRepository,
    IHomeworkManagementRepository,
    IHomeworkSubmissionRepository,
    IHomeworkReviewRepository,
    IAdminHomeworkRepository,
    IHomeworkContextRepository {}
