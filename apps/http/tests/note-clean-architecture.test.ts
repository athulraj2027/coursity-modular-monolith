import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  NoteEntity,
  INoteRepository,
  LectureCourseContext,
  CreateNoteDTO,
  UpdateNoteDTO,
  NoteFilterParams,
  PaginatedNotesResult,
  NoteFilePolicy,
  NoteValidationPolicy,
  NoteAccessPolicy,
  CreateNoteUseCase,
  UpdateNoteUseCase,
  DeleteNoteUseCase,
  GetNoteDetailUseCase,
  GetNotesByLectureUseCase,
  GetNotesByCourseUseCase,
  AdminListNotesUseCase,
  createNoteModule,
  createNoteBodySchema,
  updateNoteBodySchema,
  noteQueryObjectSchema,
  NoteNotFoundError,
  NoteAccessDeniedError,
  NoteValidationError,
} from "../src/modules/note";
import { ITeacherProfileResolver } from "@/modules/course/domain/services/teacher-profile-resolver.service";

// ============================================================================
// IN-MEMORY NOTE REPOSITORY MOCK
// ============================================================================

class InMemoryNoteRepository implements INoteRepository {
  public notes: Map<string, NoteEntity> = new Map();
  public lectures: Map<string, LectureCourseContext> = new Map();
  public enrolledStudents: Set<string> = new Set(); // format: `${studentId}:${courseId}`

  async findById(id: string, includeDeleted = false): Promise<NoteEntity | null> {
    const note = this.notes.get(id);
    if (!note) return null;
    if (!includeDeleted && note.isDeleted) return null;
    return { ...note };
  }

  async findByLectureId(lectureId: string, includeDeleted = false): Promise<NoteEntity[]> {
    return Array.from(this.notes.values())
      .filter((n) => n.lectureId === lectureId && (includeDeleted || (!n.isDeleted && n.isPublished)))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async findByCourseId(courseId: string, includeDeleted = false): Promise<NoteEntity[]> {
    return Array.from(this.notes.values())
      .filter((n) => n.courseId === courseId && (includeDeleted || (!n.isDeleted && n.isPublished)))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async countByLectureId(lectureId: string): Promise<number> {
    return Array.from(this.notes.values()).filter((n) => n.lectureId === lectureId && !n.isDeleted).length;
  }

  async countByCourseId(courseId: string): Promise<number> {
    return Array.from(this.notes.values()).filter((n) => n.courseId === courseId && !n.isDeleted).length;
  }

  async create(courseId: string, teacherProfileId: string, data: CreateNoteDTO): Promise<NoteEntity> {
    const id = `note_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const now = new Date();
    const lecture = this.lectures.get(data.lectureId);

    const entity: NoteEntity = {
      id,
      name: data.name,
      description: data.description || null,
      fileUrl: data.fileUrl,
      fileKey: data.fileKey,
      fileType: data.fileType,
      fileExtension: data.fileExtension || null,
      fileSizeBytes: data.fileSizeBytes ?? 0,
      lectureId: data.lectureId,
      courseId,
      teacherProfileId,
      sortOrder: data.sortOrder ?? 0,
      isPublished: true,
      isDeleted: false,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
      lectureTitle: lecture?.title || "Test Lecture",
      courseTitle: lecture?.courseTitle || "Test Course",
    };

    this.notes.set(id, entity);
    return { ...entity };
  }

  async update(id: string, data: UpdateNoteDTO): Promise<NoteEntity> {
    const existing = this.notes.get(id);
    if (!existing) {
      throw new NoteNotFoundError(`Note with ID ${id} not found`);
    }

    const updated: NoteEntity = {
      ...existing,
      name: data.name !== undefined ? data.name : existing.name,
      description: data.description !== undefined ? data.description : existing.description,
      fileUrl: data.fileUrl !== undefined ? data.fileUrl : existing.fileUrl,
      fileKey: data.fileKey !== undefined ? data.fileKey : existing.fileKey,
      fileType: data.fileType !== undefined ? data.fileType : existing.fileType,
      fileExtension: data.fileExtension !== undefined ? data.fileExtension : existing.fileExtension,
      fileSizeBytes: data.fileSizeBytes !== undefined ? data.fileSizeBytes : existing.fileSizeBytes,
      sortOrder: data.sortOrder !== undefined ? data.sortOrder : existing.sortOrder,
      isPublished: data.isPublished !== undefined ? data.isPublished : existing.isPublished,
      updatedAt: new Date(),
    };

    this.notes.set(id, updated);
    return { ...updated };
  }

  async softDelete(id: string): Promise<boolean> {
    const existing = this.notes.get(id);
    if (!existing) return false;
    existing.isDeleted = true;
    existing.deletedAt = new Date();
    existing.isPublished = false;
    this.notes.set(id, existing);
    return true;
  }

  async hardDelete(id: string): Promise<boolean> {
    return this.notes.delete(id);
  }

  async findLectureWithCourse(lectureId: string): Promise<LectureCourseContext | null> {
    const lecture = this.lectures.get(lectureId);
    return lecture ? { ...lecture } : null;
  }

  async findManyAdmin(params: NoteFilterParams): Promise<PaginatedNotesResult<NoteEntity>> {
    let all = Array.from(this.notes.values()).filter((n) => !n.isDeleted);

    if (params.courseId) all = all.filter((n) => n.courseId === params.courseId);
    if (params.lectureId) all = all.filter((n) => n.lectureId === params.lectureId);
    if (params.teacherProfileId) all = all.filter((n) => n.teacherProfileId === params.teacherProfileId);
    if (params.search) {
      const q = params.search.toLowerCase();
      all = all.filter(
        (n) =>
          n.name.toLowerCase().includes(q) ||
          (n.description && n.description.toLowerCase().includes(q))
      );
    }

    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const paginated = all.slice(startIndex, startIndex + limit);

    return {
      items: paginated.map((n) => ({ ...n })),
      total: all.length,
      page,
      limit,
      totalPages: Math.ceil(all.length / limit) || 1,
    };
  }

  async isStudentEnrolled(studentId: string, courseId: string): Promise<boolean> {
    return this.enrolledStudents.has(`${studentId}:${courseId}`);
  }
}

class MockTeacherProfileResolver implements ITeacherProfileResolver {
  public mapping: Map<string, string> = new Map();

  constructor() {
    this.mapping.set("user_teacher_1", "teacher_profile_1");
    this.mapping.set("user_teacher_2", "teacher_profile_2");
  }

  async getTeacherProfileIdByUserId(userId: string): Promise<string> {
    return this.mapping.has(userId) ? this.mapping.get(userId)! : `teacher_profile_of_${userId}`;
  }
}

// ============================================================================
// TEST SUITES
// ============================================================================

describe("Note Module Clean Architecture & SOLID Principles Suite", () => {
  let repo: InMemoryNoteRepository;
  let profileResolver: MockTeacherProfileResolver;

  beforeEach(() => {
    repo = new InMemoryNoteRepository();
    profileResolver = new MockTeacherProfileResolver();

    // Seed mock lecture and course contexts
    repo.lectures.set("lec_1", {
      id: "lec_1",
      title: "Clean Architecture Principles",
      courseId: "course_1",
      courseTitle: "Enterprise TypeScript",
      teacherProfileId: "teacher_profile_1",
    });

    repo.lectures.set("lec_2", {
      id: "lec_2",
      title: "Domain Driven Design Patterns",
      courseId: "course_2",
      courseTitle: "Advanced Software Architecture",
      teacherProfileId: "teacher_profile_2",
    });
  });

  // --------------------------------------------------------------------------
  // SUITE 1: Domain Policies
  // --------------------------------------------------------------------------
  describe("1. Domain Policies", () => {
    describe("NoteFilePolicy", () => {
      it("extracts clean file extension from complex URLs with query params and hashes", () => {
        const url = "https://s3.amazonaws.com/coursity-notes/lecture-01-slides.pptx?AWSAccessKeyId=AKIA123#page=3";
        const ext = NoteFilePolicy.extractExtension(url);
        assert.equal(ext, "pptx");
      });

      it("respects provided extension and strips leading dots", () => {
        assert.equal(NoteFilePolicy.extractExtension(null, ".pdf"), "pdf");
        assert.equal(NoteFilePolicy.extractExtension(null, "DOCX"), "docx");
      });

      it("identifies allowed and forbidden file extensions", () => {
        assert.equal(NoteFilePolicy.isAllowedExtension("pdf"), true);
        assert.equal(NoteFilePolicy.isAllowedExtension("pptx"), true);
        assert.equal(NoteFilePolicy.isAllowedExtension("docx"), true);
        assert.equal(NoteFilePolicy.isAllowedExtension("zip"), true);
        assert.equal(NoteFilePolicy.isAllowedExtension("exe"), false);
        assert.equal(NoteFilePolicy.isAllowedExtension("sh"), false);
      });

      it("rejects unsupported extensions with NoteValidationError", () => {
        assert.throws(
          () => {
            NoteFilePolicy.validateFile({
              fileUrl: "https://s3.com/malicious.exe",
              fileKey: "notes/malicious.exe",
            });
          },
          (err: any) => err instanceof NoteValidationError && err.message.includes("Unsupported file extension")
        );
      });

      it("rejects negative file sizes and files exceeding 50MB limit", () => {
        assert.throws(
          () => {
            NoteFilePolicy.validateFile({
              fileUrl: "https://s3.com/deck.pdf",
              fileKey: "notes/deck.pdf",
              fileSizeBytes: -100,
            });
          },
          (err: any) => err instanceof NoteValidationError && err.message.includes("negative")
        );

        assert.throws(
          () => {
            NoteFilePolicy.validateFile({
              fileUrl: "https://s3.com/massive.pdf",
              fileKey: "notes/massive.pdf",
              fileSizeBytes: 60 * 1024 * 1024, // 60MB
            });
          },
          (err: any) => err instanceof NoteValidationError && err.message.includes("exceeds maximum")
        );
      });
    });

    describe("NoteValidationPolicy", () => {
      it("validates creation requires non-empty name and lectureId", () => {
        assert.throws(
          () => {
            NoteValidationPolicy.validateCreation({
              name: "",
              lectureId: "lec_1",
              fileUrl: "https://s3.com/doc.pdf",
              fileKey: "doc.pdf",
              fileType: "application/pdf",
            });
          },
          (err: any) => err instanceof NoteValidationError && err.message.includes("name is required")
        );

        assert.throws(
          () => {
            NoteValidationPolicy.validateCreation({
              name: "Valid Name",
              lectureId: "",
              fileUrl: "https://s3.com/doc.pdf",
              fileKey: "doc.pdf",
              fileType: "application/pdf",
            });
          },
          (err: any) => err instanceof NoteValidationError && err.message.includes("Lecture ID")
        );
      });

      it("enforces maximum name length of 200 characters", () => {
        const longName = "A".repeat(201);
        assert.throws(
          () => {
            NoteValidationPolicy.validateCreation({
              name: longName,
              lectureId: "lec_1",
              fileUrl: "https://s3.com/doc.pdf",
              fileKey: "doc.pdf",
              fileType: "application/pdf",
            });
          },
          (err: any) => err instanceof NoteValidationError && err.message.includes("cannot exceed 200")
        );
      });
    });

    describe("NoteAccessPolicy", () => {
      it("governs upload role permissions", () => {
        assert.equal(NoteAccessPolicy.canUploadNote("TEACHER"), true);
        assert.equal(NoteAccessPolicy.canUploadNote("ADMIN"), true);
        assert.equal(NoteAccessPolicy.canUploadNote("SUPERADMIN"), true);
        assert.equal(NoteAccessPolicy.canUploadNote("STUDENT"), false);
        assert.equal(NoteAccessPolicy.canUploadNote("USER"), false);
      });

      it("governs instructor lecture ownership", () => {
        assert.equal(NoteAccessPolicy.isTeacherAuthorizedForLecture("teacher_1", "teacher_1"), true);
        assert.equal(NoteAccessPolicy.isTeacherAuthorizedForLecture("teacher_1", "teacher_2"), false);
        assert.equal(NoteAccessPolicy.isTeacherAuthorizedForLecture(null, "teacher_1"), false);
      });

      it("governs note modification permission", () => {
        assert.equal(NoteAccessPolicy.canModifyNote("ADMIN", null, "teacher_1"), true);
        assert.equal(NoteAccessPolicy.canModifyNote("TEACHER", "teacher_1", "teacher_1"), true);
        assert.equal(NoteAccessPolicy.canModifyNote("TEACHER", "teacher_2", "teacher_1"), false);
        assert.equal(NoteAccessPolicy.canModifyNote("STUDENT", "student_1", "teacher_1"), false);
      });
    });
  });

  // --------------------------------------------------------------------------
  // SUITE 2: Teacher Note Authoring & Management
  // --------------------------------------------------------------------------
  describe("2. Teacher Note Authoring & Management", () => {
    it("successfully creates a note for an owned course/lecture", async () => {
      const useCase = new CreateNoteUseCase(repo, profileResolver);
      const note = await useCase.execute({
        userId: "user_teacher_1",
        userRole: "TEACHER",
        data: {
          name: "Lecture 01 Slide Deck",
          description: "Slides on Clean Architecture",
          fileUrl: "https://s3.amazonaws.com/bucket/notes/lecture-01.pdf",
          fileKey: "notes/lecture-01.pdf",
          fileType: "application/pdf",
          lectureId: "lec_1",
          fileSizeBytes: 2048000,
        },
      });

      assert.ok(note.id);
      assert.equal(note.name, "Lecture 01 Slide Deck");
      assert.equal(note.fileExtension, "pdf");
      assert.equal(note.courseId, "course_1");
      assert.equal(note.teacherProfileId, "teacher_profile_1");
    });

    it("throws NoteNotFoundError when target lecture does not exist", async () => {
      const useCase = new CreateNoteUseCase(repo, profileResolver);
      await assert.rejects(
        async () => {
          await useCase.execute({
            userId: "user_teacher_1",
            userRole: "TEACHER",
            data: {
              name: "Orphan Note",
              fileUrl: "https://s3.amazonaws.com/bucket/notes/lec.pdf",
              fileKey: "notes/lec.pdf",
              fileType: "application/pdf",
              lectureId: "non_existent_lecture",
            },
          });
        },
        (err: any) => err instanceof NoteNotFoundError && err.message.includes("lecture not found")
      );
    });

    it("throws NoteAccessDeniedError when teacher attempts to add note to another teacher's lecture (IDOR guard)", async () => {
      const useCase = new CreateNoteUseCase(repo, profileResolver);
      await assert.rejects(
        async () => {
          // user_teacher_2 attempts to upload to lec_1 (owned by teacher_profile_1)
          await useCase.execute({
            userId: "user_teacher_2",
            userRole: "TEACHER",
            data: {
              name: "Unauthorized Note",
              fileUrl: "https://s3.amazonaws.com/bucket/notes/hack.pdf",
              fileKey: "notes/hack.pdf",
              fileType: "application/pdf",
              lectureId: "lec_1",
            },
          });
        },
        (err: any) => err instanceof NoteAccessDeniedError && err.message.includes("courses you instruct")
      );
    });

    it("throws NoteAccessDeniedError when student attempts to upload notes", async () => {
      const useCase = new CreateNoteUseCase(repo, profileResolver);
      await assert.rejects(
        async () => {
          await useCase.execute({
            userId: "student_1",
            userRole: "STUDENT",
            data: {
              name: "Student Note",
              fileUrl: "https://s3.amazonaws.com/bucket/notes/note.pdf",
              fileKey: "notes/note.pdf",
              fileType: "application/pdf",
              lectureId: "lec_1",
            },
          });
        },
        (err: any) => err instanceof NoteAccessDeniedError && err.message.includes("Only instructors and administrators")
      );
    });

    it("updates note details successfully for the author", async () => {
      const createUseCase = new CreateNoteUseCase(repo, profileResolver);
      const note = await createUseCase.execute({
        userId: "user_teacher_1",
        userRole: "TEACHER",
        data: {
          name: "Original Name",
          fileUrl: "https://s3.com/orig.pdf",
          fileKey: "orig.pdf",
          fileType: "application/pdf",
          lectureId: "lec_1",
        },
      });

      const updateUseCase = new UpdateNoteUseCase(repo, profileResolver);
      const updated = await updateUseCase.execute({
        noteId: note.id,
        userId: "user_teacher_1",
        userRole: "TEACHER",
        data: {
          name: "Updated Slide Deck Name",
          description: "Updated notes description",
        },
      });

      assert.equal(updated.name, "Updated Slide Deck Name");
      assert.equal(updated.description, "Updated notes description");
    });

    it("rejects update when teacher does not own the note (IDOR guard)", async () => {
      const createUseCase = new CreateNoteUseCase(repo, profileResolver);
      const note = await createUseCase.execute({
        userId: "user_teacher_1",
        userRole: "TEACHER",
        data: {
          name: "Teacher 1 Note",
          fileUrl: "https://s3.com/note.pdf",
          fileKey: "note.pdf",
          fileType: "application/pdf",
          lectureId: "lec_1",
        },
      });

      const updateUseCase = new UpdateNoteUseCase(repo, profileResolver);
      await assert.rejects(
        async () => {
          await updateUseCase.execute({
            noteId: note.id,
            userId: "user_teacher_2",
            userRole: "TEACHER",
            data: { name: "Hijacked Note Name" },
          });
        },
        (err: any) => err instanceof NoteAccessDeniedError && err.message.includes("modify notes you have uploaded")
      );
    });

    it("soft-deletes note successfully for owner teacher", async () => {
      const createUseCase = new CreateNoteUseCase(repo, profileResolver);
      const note = await createUseCase.execute({
        userId: "user_teacher_1",
        userRole: "TEACHER",
        data: {
          name: "Deletable Note",
          fileUrl: "https://s3.com/del.pdf",
          fileKey: "del.pdf",
          fileType: "application/pdf",
          lectureId: "lec_1",
        },
      });

      const deleteUseCase = new DeleteNoteUseCase(repo, profileResolver);
      const success = await deleteUseCase.execute({
        noteId: note.id,
        userId: "user_teacher_1",
        userRole: "TEACHER",
      });

      assert.equal(success, true);
      const found = await repo.findById(note.id);
      assert.equal(found, null); // Hidden by default
    });
  });

  // --------------------------------------------------------------------------
  // SUITE 3: Student Note Access & IDOR Guards
  // --------------------------------------------------------------------------
  describe("3. Student Note Access & IDOR Guards", () => {
    let note: NoteEntity;

    beforeEach(async () => {
      const createUseCase = new CreateNoteUseCase(repo, profileResolver);
      note = await createUseCase.execute({
        userId: "user_teacher_1",
        userRole: "TEACHER",
        data: {
          name: "Course 1 Class Notes",
          fileUrl: "https://s3.amazonaws.com/notes/class-notes.pdf",
          fileKey: "notes/class-notes.pdf",
          fileType: "application/pdf",
          lectureId: "lec_1",
        },
      });
    });

    it("allows enrolled student to access note details", async () => {
      repo.enrolledStudents.add("student_42:course_1");

      const useCase = new GetNoteDetailUseCase(repo, profileResolver);
      const result = await useCase.execute({
        noteId: note.id,
        userId: "student_42",
        userRole: "STUDENT",
      });

      assert.equal(result.id, note.id);
      assert.equal(result.name, "Course 1 Class Notes");
    });

    it("rejects non-enrolled student from accessing note details", async () => {
      const useCase = new GetNoteDetailUseCase(repo, profileResolver);
      await assert.rejects(
        async () => {
          await useCase.execute({
            noteId: note.id,
            userId: "unenrolled_student",
            userRole: "STUDENT",
          });
        },
        (err: any) => err instanceof NoteAccessDeniedError && err.message.includes("enrolled students")
      );
    });

    it("allows enrolled student to list notes by lecture", async () => {
      repo.enrolledStudents.add("student_42:course_1");

      const useCase = new GetNotesByLectureUseCase(repo, profileResolver);
      const notes = await useCase.execute({
        lectureId: "lec_1",
        userId: "student_42",
        userRole: "STUDENT",
      });

      assert.equal(notes.length, 1);
      assert.equal(notes[0].id, note.id);
    });

    it("rejects non-enrolled student from listing notes by lecture", async () => {
      const useCase = new GetNotesByLectureUseCase(repo, profileResolver);
      await assert.rejects(
        async () => {
          await useCase.execute({
            lectureId: "lec_1",
            userId: "unregistered_student",
            userRole: "STUDENT",
          });
        },
        (err: any) => err instanceof NoteAccessDeniedError && err.message.includes("enrolled in this course")
      );
    });

    it("allows enrolled student to list notes by course", async () => {
      repo.enrolledStudents.add("student_42:course_1");

      const useCase = new GetNotesByCourseUseCase(repo, profileResolver);
      const notes = await useCase.execute({
        courseId: "course_1",
        userId: "student_42",
        userRole: "STUDENT",
      });

      assert.equal(notes.length, 1);
      assert.equal(notes[0].id, note.id);
    });

    it("rejects non-enrolled student from listing notes by course", async () => {
      const useCase = new GetNotesByCourseUseCase(repo, profileResolver);
      await assert.rejects(
        async () => {
          await useCase.execute({
            courseId: "course_1",
            userId: "unregistered_student",
            userRole: "STUDENT",
          });
        },
        (err: any) => err instanceof NoteAccessDeniedError && err.message.includes("enrolled in this course")
      );
    });
  });

  // --------------------------------------------------------------------------
  // SUITE 4: Administrative Oversight
  // --------------------------------------------------------------------------
  describe("4. Administrative Oversight", () => {
    it("admin can access any note detail without enrollment or authorship", async () => {
      const createUseCase = new CreateNoteUseCase(repo, profileResolver);
      const note = await createUseCase.execute({
        userId: "user_teacher_1",
        userRole: "TEACHER",
        data: {
          name: "Teacher Note",
          fileUrl: "https://s3.com/note.pdf",
          fileKey: "note.pdf",
          fileType: "application/pdf",
          lectureId: "lec_1",
        },
      });

      const getDetailUseCase = new GetNoteDetailUseCase(repo, profileResolver);
      const result = await getDetailUseCase.execute({
        noteId: note.id,
        userId: "admin_1",
        userRole: "ADMIN",
      });

      assert.equal(result.id, note.id);
    });

    it("admin can delete any note", async () => {
      const createUseCase = new CreateNoteUseCase(repo, profileResolver);
      const note = await createUseCase.execute({
        userId: "user_teacher_1",
        userRole: "TEACHER",
        data: {
          name: "Admin Deletable",
          fileUrl: "https://s3.com/del.pdf",
          fileKey: "del.pdf",
          fileType: "application/pdf",
          lectureId: "lec_1",
        },
      });

      const deleteUseCase = new DeleteNoteUseCase(repo, profileResolver);
      const deleted = await deleteUseCase.execute({
        noteId: note.id,
        userId: "admin_1",
        userRole: "ADMIN",
      });

      assert.equal(deleted, true);
    });

    it("admin listing returns paginated results with search", async () => {
      const createUseCase = new CreateNoteUseCase(repo, profileResolver);
      await createUseCase.execute({
        userId: "user_teacher_1",
        userRole: "TEACHER",
        data: {
          name: "Architecture Diagram PDF",
          fileUrl: "https://s3.com/arch.pdf",
          fileKey: "arch.pdf",
          fileType: "application/pdf",
          lectureId: "lec_1",
        },
      });

      await createUseCase.execute({
        userId: "user_teacher_2",
        userRole: "TEACHER",
        data: {
          name: "Database Schema PPTX",
          fileUrl: "https://s3.com/db.pptx",
          fileKey: "db.pptx",
          fileType: "application/vnd.ms-powerpoint",
          lectureId: "lec_2",
        },
      });

      const adminListUseCase = new AdminListNotesUseCase(repo);
      const result = await adminListUseCase.execute({
        search: "Architecture",
        page: 1,
        limit: 10,
      });

      assert.equal(result.total, 1);
      assert.equal(result.items[0].name, "Architecture Diagram PDF");
    });
  });

  // --------------------------------------------------------------------------
  // SUITE 5: Presentation Schemas & Input Validation
  // --------------------------------------------------------------------------
  describe("5. Presentation Schemas & Input Validation", () => {
    it("validates createNoteBodySchema accepts valid payload", () => {
      const parsed = createNoteBodySchema.parse({
        name: "Valid Note Title",
        fileUrl: "https://s3.amazonaws.com/notes/valid.pdf",
        fileKey: "notes/valid.pdf",
        fileType: "application/pdf",
        lectureId: "123e4567-e89b-12d3-a456-426614174000",
        fileSizeBytes: 1024,
      });

      assert.equal(parsed.name, "Valid Note Title");
      assert.equal(parsed.fileKey, "notes/valid.pdf");
    });

    it("rejects createNoteBodySchema with invalid URL or non-uuid lectureId", () => {
      assert.throws(() => {
        createNoteBodySchema.parse({
          name: "Valid Title",
          fileUrl: "not-a-url",
          fileKey: "key",
          fileType: "application/pdf",
          lectureId: "123e4567-e89b-12d3-a456-426614174000",
        });
      });

      assert.throws(() => {
        createNoteBodySchema.parse({
          name: "Valid Title",
          fileUrl: "https://valid.com/file.pdf",
          fileKey: "key",
          fileType: "application/pdf",
          lectureId: "not-a-uuid",
        });
      });
    });

    it("parses and transforms noteQueryObjectSchema pagination strings to numbers", () => {
      const parsed = noteQueryObjectSchema.parse({
        page: "3",
        limit: "15",
        sort: "name-asc",
      });

      assert.equal(parsed.page, 3);
      assert.equal(parsed.limit, 15);
      assert.equal(parsed.sort, "name-asc");
    });
  });

  // --------------------------------------------------------------------------
  // SUITE 6: Dependency Inversion Module Factory
  // --------------------------------------------------------------------------
  describe("6. Dependency Inversion Module Factory", () => {
    it("createNoteModule instantiates cleanly with custom injected dependencies", () => {
      const customRepo = new InMemoryNoteRepository();
      const customResolver = new MockTeacherProfileResolver();

      const moduleInstance = createNoteModule({
        noteRepo: customRepo,
        teacherProfileResolver: customResolver,
      });

      assert.ok(moduleInstance.noteRouter);
      assert.ok(moduleInstance.noteRepo);
      assert.ok(moduleInstance.noteController);
      assert.ok(moduleInstance.useCases.createNoteUseCase);
      assert.ok(moduleInstance.useCases.getNoteDetailUseCase);
      assert.ok(moduleInstance.useCases.adminListNotesUseCase);
    });
  });
});
