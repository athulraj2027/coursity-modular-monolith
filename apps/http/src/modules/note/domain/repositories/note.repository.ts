import { NoteEntity } from "../entities/note.entity";
import { CreateNoteDTO, UpdateNoteDTO, NoteFilterParams, PaginatedNotesResult } from "../dtos/note.dto";

export interface INoteRepository {
  findById(id: string, includeDeleted?: boolean): Promise<NoteEntity | null>;
  findByLectureId(lectureId: string, includeDeleted?: boolean): Promise<NoteEntity[]>;
  findByCourseId(courseId: string, includeDeleted?: boolean): Promise<NoteEntity[]>;
  findManyAdmin(params: NoteFilterParams): Promise<PaginatedNotesResult<NoteEntity>>;
  create(courseId: string, teacherProfileId: string, data: CreateNoteDTO): Promise<NoteEntity>;
  update(id: string, data: UpdateNoteDTO): Promise<NoteEntity>;
  softDelete(id: string): Promise<boolean>;
  hardDelete(id: string): Promise<boolean>;
  countByLectureId(lectureId: string): Promise<number>;
  countByCourseId(courseId: string): Promise<number>;
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
