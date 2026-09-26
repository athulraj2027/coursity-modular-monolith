import { LectureEntity } from "../entities/lecture.entity";
import {
  CreateLectureDTO,
  UpdateLectureDTO,
  LectureFilterParams,
  PaginatedLecturesResult,
} from "../dtos/lecture.dto";

export interface ILectureRepository {
  findById(id: string, includeDeleted?: boolean): Promise<LectureEntity | null>;
  
  findManyTeacherLectures(
    teacherProfileId: string,
    params: LectureFilterParams
  ): Promise<PaginatedLecturesResult<LectureEntity>>;

  findManyAdminLectures(
    params: LectureFilterParams
  ): Promise<PaginatedLecturesResult<LectureEntity>>;

  findManyStudentLectures(
    studentId: string,
    params: LectureFilterParams
  ): Promise<PaginatedLecturesResult<LectureEntity>>;

  findConflictingLecture(
    teacherProfileId: string,
    startTime: Date,
    endTime: Date,
    excludeLectureId?: string
  ): Promise<LectureEntity | null>;

  createLecture(
    courseId: string,
    moduleId: string,
    data: CreateLectureDTO
  ): Promise<LectureEntity>;

  updateLecture(
    id: string,
    data: UpdateLectureDTO
  ): Promise<LectureEntity>;

  softDeleteLecture(id: string): Promise<boolean>;

  findCourseWithDefaultModule(
    courseId: string
  ): Promise<{ id: string; teacherProfileId: string; defaultModuleId: string } | null>;
}
