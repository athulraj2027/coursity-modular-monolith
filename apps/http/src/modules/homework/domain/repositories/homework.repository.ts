import { HomeworkEntity, HomeworkSubmissionEntity } from "../entities/homework.entity";
import {
  CreateHomeworkDTO,
  UpdateHomeworkDTO,
  SubmitHomeworkDTO,
  ReviewSubmissionDTO,
  HomeworkFilterParams,
  PaginatedResult,
} from "../dtos/homework.dto";

export interface IHomeworkRepository {
  findById(id: string, includeDeleted?: boolean): Promise<HomeworkEntity | null>;
  findByLectureId(lectureId: string, studentId?: string, includeDeleted?: boolean): Promise<HomeworkEntity[]>;
  findByCourseId(courseId: string, studentId?: string, includeDeleted?: boolean): Promise<HomeworkEntity[]>;
  findManyAdmin(params: HomeworkFilterParams): Promise<PaginatedResult<HomeworkEntity>>;
  create(courseId: string, teacherProfileId: string, data: CreateHomeworkDTO): Promise<HomeworkEntity>;
  update(id: string, data: UpdateHomeworkDTO): Promise<HomeworkEntity>;
  softDelete(id: string): Promise<boolean>;

  // Submissions operations
  findSubmission(homeworkId: string, studentId: string): Promise<HomeworkSubmissionEntity | null>;
  findSubmissionById(submissionId: string): Promise<HomeworkSubmissionEntity | null>;
  findSubmissionsByHomeworkId(homeworkId: string): Promise<HomeworkSubmissionEntity[]>;
  createOrUpdateSubmission(
    homeworkId: string,
    studentId: string,
    data: SubmitHomeworkDTO,
    isLate: boolean
  ): Promise<HomeworkSubmissionEntity>;
  reviewSubmission(
    submissionId: string,
    reviewedByTeacherId: string,
    data: ReviewSubmissionDTO
  ): Promise<HomeworkSubmissionEntity>;

  // Helper context lookups
  findLectureWithCourse(lectureId: string): Promise<{
    id: string;
    title: string;
    courseId: string;
    courseTitle: string;
    teacherProfileId: string;
  } | null>;
  isStudentEnrolled(studentId: string, courseId: string): Promise<boolean>;
  getTeacherProfileIdByUserId(userId: string): Promise<string | null>;
}
