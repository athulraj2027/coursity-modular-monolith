import { NoteEntity } from "../entities/note.entity";
import {
  CreateNoteDTO,
  UpdateNoteDTO,
  NoteFilterParams,
  PaginatedNotesResult,
} from "../dtos/note.dto";

export interface LectureCourseContext {
  id: string;
  title: string;
  courseId: string;
  courseTitle: string;
  teacherProfileId: string;
}

/**
 * Segregated query repository for reading notes and counting
 */
export interface INoteQueryRepository {
  findById(id: string, includeDeleted?: boolean): Promise<NoteEntity | null>;
  findByLectureId(lectureId: string, includeDeleted?: boolean): Promise<NoteEntity[]>;
  findByCourseId(courseId: string, includeDeleted?: boolean): Promise<NoteEntity[]>;
  countByLectureId(lectureId: string): Promise<number>;
  countByCourseId(courseId: string): Promise<number>;
}

/**
 * Segregated repository for teacher note authoring, editing, deletion, and context
 */
export interface ITeacherNoteRepository {
  create(courseId: string, teacherProfileId: string, data: CreateNoteDTO): Promise<NoteEntity>;
  update(id: string, data: UpdateNoteDTO): Promise<NoteEntity>;
  softDelete(id: string): Promise<boolean>;
  hardDelete(id: string): Promise<boolean>;
  findLectureWithCourse(lectureId: string): Promise<LectureCourseContext | null>;
}

/**
 * Segregated repository for administrative listing and search
 */
export interface IAdminNoteRepository {
  findManyAdmin(params: NoteFilterParams): Promise<PaginatedNotesResult<NoteEntity>>;
}

/**
 * Segregated repository for verifying student enrollment access
 */
export interface IStudentNoteAccessRepository {
  isStudentEnrolled(studentId: string, courseId: string): Promise<boolean>;
}

/**
 * Unified Note Repository Interface (ISP Aggregator)
 */
export interface INoteRepository
  extends INoteQueryRepository,
    ITeacherNoteRepository,
    IAdminNoteRepository,
    IStudentNoteAccessRepository {
  /**
   * Optional helper for resolving teacher profiles (prefer ITeacherProfileResolver)
   */
  getTeacherProfileIdByUserId?(userId: string): Promise<string | null>;
}
