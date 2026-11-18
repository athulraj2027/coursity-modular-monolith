import { LectureEntity } from "../entities/lecture.entity";
import {
  CreateLectureDTO,
  UpdateLectureDTO,
  LectureFilterParams,
  PaginatedLecturesResult,
} from "../dtos/lecture.dto";

export interface CourseDefaultModuleContext {
  id: string;
  teacherProfileId: string;
  defaultModuleId: string;
  startingDate: Date | null;
  title: string;
}

export interface StudentLessonAccessContext {
  hasActiveEnrollment: boolean;
  attendedLive: boolean;
  isCompleted: boolean;
}

/**
 * Segregated query repository for reading single lecture entities
 */
export interface ILectureQueryRepository {
  findById(id: string, includeDeleted?: boolean): Promise<LectureEntity | null>;
}

/**
 * Segregated repository for teacher lecture management, scheduling, and conflict detection
 */
export interface ITeacherLectureRepository {
  findManyTeacherLectures(
    teacherProfileId: string,
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
  ): Promise<CourseDefaultModuleContext | null>;
}

/**
 * Segregated repository for administrative lecture oversight
 */
export interface IAdminLectureRepository {
  findManyAdminLectures(
    params: LectureFilterParams
  ): Promise<PaginatedLecturesResult<LectureEntity>>;
}

/**
 * Segregated repository for student lecture queries and progress checks
 */
export interface IStudentLectureRepository {
  findManyStudentLectures(
    studentId: string,
    params: LectureFilterParams
  ): Promise<PaginatedLecturesResult<LectureEntity>>;

  findStudentLessonAccess(
    studentId: string,
    courseId: string,
    lessonId: string
  ): Promise<StudentLessonAccessContext>;
}

/**
 * Unified Lecture Repository Interface (ISP Aggregator)
 */
export interface ILectureRepository
  extends ILectureQueryRepository,
    ITeacherLectureRepository,
    IAdminLectureRepository,
    IStudentLectureRepository {}
