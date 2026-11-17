import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  LectureEntity,
  LiveClassStatus,
  ILectureRepository,
  CourseDefaultModuleContext,
  StudentLessonAccessContext,
  LectureFilterParams,
  PaginatedLecturesResult,
  CreateLectureDTO,
  UpdateLectureDTO,
  LectureSchedulePolicy,
  LectureValidationPolicy,
  LectureLiveStatusPolicy,
  TeacherCreateLectureUseCase,
  TeacherUpdateLectureUseCase,
  TeacherDeleteLectureUseCase,
  TeacherGetLectureDetailUseCase,
  TeacherGetLecturesUseCase,
  AdminGetLectureDetailUseCase,
  AdminGetLecturesUseCase,
  StudentGetLectureDetailUseCase,
  StudentGetLecturesUseCase,
  createLectureModule,
  createLectureBodySchema,
  updateLectureBodySchema,
  lectureQueryObjectSchema,
  LectureNotFoundError,
  LectureAccessDeniedError,
  LectureConflictError,
  LectureValidationError,
} from "../src/modules/lecture";
import { ITeacherProfileResolver } from "@/modules/course/domain/services/teacher-profile-resolver.service";

// ============================================================================
// IN-MEMORY LECTURE REPOSITORY MOCK
// ============================================================================

class InMemoryLectureRepository implements ILectureRepository {
  public lectures: Map<string, LectureEntity> = new Map();
  public courses: Map<string, CourseDefaultModuleContext> = new Map();
  public studentAccess: Map<string, StudentLessonAccessContext> = new Map(); // key: `${studentId}:${courseId}:${lessonId}`

  async findById(id: string, includeDeleted = false): Promise<LectureEntity | null> {
    const lecture = this.lectures.get(id);
    if (!lecture) return null;
    if (!includeDeleted && lecture.isDeleted) return null;
    return { ...lecture };
  }

  async findManyTeacherLectures(
    teacherProfileId: string,
    params: LectureFilterParams
  ): Promise<PaginatedLecturesResult<LectureEntity>> {
    const all = Array.from(this.lectures.values()).filter(
      (l) => l.teacherId === teacherProfileId && !l.isDeleted
    );
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const paginated = all.slice(startIndex, startIndex + limit);

    return {
      lectures: paginated.map((l) => ({ ...l })),
      total: all.length,
      page,
      limit,
      totalPages: Math.ceil(all.length / limit) || 1,
    };
  }

  async findConflictingLecture(
    teacherProfileId: string,
    startTime: Date,
    endTime: Date,
    excludeLectureId?: string
  ): Promise<LectureEntity | null> {
    const startMs = startTime.getTime();
    const endMs = endTime.getTime();

    for (const lecture of this.lectures.values()) {
      if (lecture.teacherId !== teacherProfileId) continue;
      if (lecture.isDeleted) continue;
      if (excludeLectureId && lecture.id === excludeLectureId) continue;
      if (!lecture.scheduledAt) continue;

      const lecStart = new Date(lecture.scheduledAt).getTime();
      const lecEnd = lecStart + (lecture.durationSeconds || 3600) * 1000;

      // Overlap formula: start < otherEnd && end > otherStart
      if (startMs < lecEnd && endMs > lecStart) {
        return { ...lecture };
      }
    }
    return null;
  }

  async createLecture(
    courseId: string,
    moduleId: string,
    data: CreateLectureDTO
  ): Promise<LectureEntity> {
    const id = `lec_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const now = new Date();
    const course = this.courses.get(courseId);

    const entity: LectureEntity = {
      id,
      moduleId,
      title: data.title,
      description: data.description || null,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      durationSeconds: data.durationSeconds ?? 3600,
      sortOrder: data.sortOrder ?? 0,
      liveStatus: "SCHEDULED",
      isLiveNow: false,
      isPublished: true,
      isDeleted: false,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
      courseId,
      courseTitle: course?.title || "Test Course",
      teacherId: course?.teacherProfileId || "teacher_default",
      courseStartingDate: course?.startingDate || null,
    };

    this.lectures.set(id, entity);
    return { ...entity };
  }

  async updateLecture(id: string, data: UpdateLectureDTO): Promise<LectureEntity> {
    const existing = this.lectures.get(id);
    if (!existing) {
      throw new LectureNotFoundError(`Lecture with ID ${id} not found.`);
    }

    const updated: LectureEntity = {
      ...existing,
      title: data.title !== undefined ? data.title : existing.title,
      description: data.description !== undefined ? data.description : existing.description,
      scheduledAt: data.scheduledAt !== undefined ? (data.scheduledAt ? new Date(data.scheduledAt) : null) : existing.scheduledAt,
      durationSeconds: data.durationSeconds !== undefined ? data.durationSeconds : existing.durationSeconds,
      sortOrder: data.sortOrder !== undefined ? data.sortOrder : existing.sortOrder,
      liveStatus: data.liveStatus !== undefined ? data.liveStatus : existing.liveStatus,
      isLiveNow: data.isLiveNow !== undefined ? data.isLiveNow : existing.isLiveNow,
      isPublished: data.isPublished !== undefined ? data.isPublished : existing.isPublished,
      updatedAt: new Date(),
    };

    this.lectures.set(id, updated);
    return { ...updated };
  }

  async softDeleteLecture(id: string): Promise<boolean> {
    const existing = this.lectures.get(id);
    if (!existing) return false;
    existing.isDeleted = true;
    existing.deletedAt = new Date();
    this.lectures.set(id, existing);
    return true;
  }

  async findCourseWithDefaultModule(courseId: string): Promise<CourseDefaultModuleContext | null> {
    const course = this.courses.get(courseId);
    return course ? { ...course } : null;
  }

  async findManyAdminLectures(params: LectureFilterParams): Promise<PaginatedLecturesResult<LectureEntity>> {
    const all = Array.from(this.lectures.values()).filter((l) => !l.isDeleted);
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const paginated = all.slice(startIndex, startIndex + limit);

    return {
      lectures: paginated.map((l) => ({ ...l })),
      total: all.length,
      page,
      limit,
      totalPages: Math.ceil(all.length / limit) || 1,
    };
  }

  async findManyStudentLectures(
    _studentId: string,
    params: LectureFilterParams
  ): Promise<PaginatedLecturesResult<LectureEntity>> {
    const all = Array.from(this.lectures.values()).filter((l) => !l.isDeleted && l.isPublished);
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const paginated = all.slice(startIndex, startIndex + limit);

    return {
      lectures: paginated.map((l) => ({ ...l })),
      total: all.length,
      page,
      limit,
      totalPages: Math.ceil(all.length / limit) || 1,
    };
  }

  async findStudentLessonAccess(
    studentId: string,
    courseId: string,
    lessonId: string
  ): Promise<StudentLessonAccessContext> {
    const key = `${studentId}:${courseId}:${lessonId}`;
    const access = this.studentAccess.get(key);
    if (access) return { ...access };
    return {
      hasActiveEnrollment: false,
      attendedLive: false,
      isCompleted: false,
    };
  }
}

class MockTeacherProfileResolver implements ITeacherProfileResolver {
  public mapping: Map<string, string | null> = new Map();

  constructor() {
    this.mapping.set("user_teacher_1", "teacher_profile_1");
    this.mapping.set("user_teacher_2", "teacher_profile_2");
    this.mapping.set("user_no_profile", null);
  }

  async resolveTeacherProfileId(userId: string): Promise<string | null> {
    return this.mapping.has(userId) ? this.mapping.get(userId)! : `teacher_profile_of_${userId}`;
  }
}

// ============================================================================
// TEST SUITES
// ============================================================================

describe("Lecture Module Clean Architecture & SOLID Principles Suite", () => {
  let repo: InMemoryLectureRepository;
  let profileResolver: MockTeacherProfileResolver;

  beforeEach(() => {
    repo = new InMemoryLectureRepository();
    profileResolver = new MockTeacherProfileResolver();

    // Seed mock courses
    repo.courses.set("course_1", {
      id: "course_1",
      teacherProfileId: "teacher_profile_1",
      defaultModuleId: "module_default_1",
      startingDate: new Date("2026-11-20T00:00:00Z"),
      title: "Clean Architecture in TypeScript",
    });

    repo.courses.set("course_2", {
      id: "course_2",
      teacherProfileId: "teacher_profile_2",
      defaultModuleId: "module_default_2",
      startingDate: new Date("2026-12-01T00:00:00Z"),
      title: "Advanced Domain Driven Design",
    });
  });

  // --------------------------------------------------------------------------
  // SUITE 1: Domain Policies
  // --------------------------------------------------------------------------
  describe("1. Domain Policies", () => {
    describe("LectureSchedulePolicy", () => {
      it("accepts valid future scheduledAt within leeway", () => {
        const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const parsed = LectureSchedulePolicy.validateScheduledTime({
          scheduledAt: futureDate,
        });
        assert.ok(parsed instanceof Date);
        assert.equal(parsed.getTime(), futureDate.getTime());
      });

      it("permits 5-minute clock drift leeway for recently passed timestamps", () => {
        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
        const parsed = LectureSchedulePolicy.validateScheduledTime({
          scheduledAt: twoMinutesAgo,
        });
        assert.ok(parsed instanceof Date);
      });

      it("rejects timestamps more than 5 minutes in the past with LectureValidationError", () => {
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        assert.throws(
          () => {
            LectureSchedulePolicy.validateScheduledTime({
              scheduledAt: tenMinutesAgo,
            });
          },
          (err: any) => err instanceof LectureValidationError && err.message.includes("past")
        );
      });

      it("enforces course starting date and rejects lectures earlier than course start", () => {
        const courseStart = new Date("2026-12-01T00:00:00Z");
        const lectureStart = new Date("2026-11-20T10:00:00Z"); // Future date relative to now, but before courseStart

        assert.throws(
          () => {
            LectureSchedulePolicy.validateScheduledTime({
              scheduledAt: lectureStart,
              courseStartingDate: courseStart,
            });
          },
          (err: any) =>
            err instanceof LectureValidationError &&
            err.message.includes("earlier than the course start date")
        );
      });

      it("calculates lecture end time accurately from start time and duration", () => {
        const start = new Date("2026-11-20T14:00:00Z");
        const duration = 3600; // 1 hour
        const end = LectureSchedulePolicy.calculateEndTime(start, duration);
        assert.equal(end.getTime(), start.getTime() + 3600 * 1000);
        assert.equal(end.toISOString(), "2026-11-20T15:00:00.000Z");
      });

      it("formats conflict error message with conflicting lecture details", () => {
        const conflictLec: LectureEntity = {
          id: "lec_conflict",
          moduleId: "mod_1",
          title: "Architecture Deep Dive",
          description: null,
          scheduledAt: new Date("2026-11-20T14:00:00Z"),
          durationSeconds: 3600,
          sortOrder: 1,
          liveStatus: "SCHEDULED",
          isLiveNow: false,
          isPublished: true,
          isDeleted: false,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const error = LectureSchedulePolicy.buildConflictError(conflictLec);
        assert.ok(error instanceof LectureConflictError);
        assert.ok(error.message.includes("Schedule conflict"));
        assert.ok(error.message.includes("Architecture Deep Dive"));
      });
    });

    describe("LectureValidationPolicy", () => {
      it("validates creation requires non-empty courseId and title >= 2 chars", () => {
        assert.throws(
          () => {
            LectureValidationPolicy.validateCreation({ courseId: "", title: "Valid Title" });
          },
          (err: any) => err instanceof LectureValidationError && err.message.includes("Course ID")
        );

        assert.throws(
          () => {
            LectureValidationPolicy.validateCreation({ courseId: "course_1", title: "A" });
          },
          (err: any) =>
            err instanceof LectureValidationError &&
            err.message.includes("at least 2 characters")
        );
      });

      it("validates duration must be at least 60 seconds", () => {
        assert.throws(
          () => {
            LectureValidationPolicy.validateCreation({
              courseId: "course_1",
              title: "Valid Title",
              durationSeconds: 30,
            });
          },
          (err: any) =>
            err instanceof LectureValidationError &&
            err.message.includes("at least 60 seconds")
        );
      });

      it("normalizes duration fallback to 3600 seconds", () => {
        assert.equal(LectureValidationPolicy.normalizeDuration(undefined), 3600);
        assert.equal(LectureValidationPolicy.normalizeDuration(null), 3600);
        assert.equal(LectureValidationPolicy.normalizeDuration(10), 3600);
        assert.equal(LectureValidationPolicy.normalizeDuration(7200), 7200);
      });
    });

    describe("LectureLiveStatusPolicy", () => {
      it("governs valid live class state transitions", () => {
        assert.equal(LectureLiveStatusPolicy.canTransition("SCHEDULED", "LIVE_NOW"), true);
        assert.equal(LectureLiveStatusPolicy.canTransition("SCHEDULED", "CANCELLED"), true);
        assert.equal(LectureLiveStatusPolicy.canTransition("SCHEDULED", "COMPLETED"), true);

        assert.equal(LectureLiveStatusPolicy.canTransition("LIVE_NOW", "COMPLETED"), true);
        assert.equal(LectureLiveStatusPolicy.canTransition("LIVE_NOW", "CANCELLED"), true);
        assert.equal(LectureLiveStatusPolicy.canTransition("LIVE_NOW", "SCHEDULED"), false);

        // Terminal states cannot transition
        assert.equal(LectureLiveStatusPolicy.canTransition("COMPLETED", "LIVE_NOW"), false);
        assert.equal(LectureLiveStatusPolicy.canTransition("CANCELLED", "SCHEDULED"), false);
      });

      it("evaluates broadcasting active state correctly", () => {
        assert.equal(LectureLiveStatusPolicy.isBroadcasting("LIVE_NOW", false), true);
        assert.equal(LectureLiveStatusPolicy.isBroadcasting("SCHEDULED", true), true);
        assert.equal(LectureLiveStatusPolicy.isBroadcasting("SCHEDULED", false), false);
      });
    });
  });

  // --------------------------------------------------------------------------
  // SUITE 2: Teacher Lecture Creation & Conflict Detection
  // --------------------------------------------------------------------------
  describe("2. Teacher Lecture Creation & Conflict Detection", () => {
    it("successfully creates a lecture with default module and duration", async () => {
      const useCase = new TeacherCreateLectureUseCase(repo);
      const scheduledAt = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

      const created = await useCase.execute("teacher_profile_1", {
        courseId: "course_1",
        title: "Clean Architecture Masterclass",
        description: "Comprehensive walkthrough of Clean Architecture",
        scheduledAt,
        durationSeconds: 5400,
      });

      assert.ok(created.id);
      assert.equal(created.title, "Clean Architecture Masterclass");
      assert.equal(created.moduleId, "module_default_1");
      assert.equal(created.durationSeconds, 5400);
      assert.equal(created.liveStatus, "SCHEDULED");
    });

    it("throws LectureNotFoundError when course does not exist", async () => {
      const useCase = new TeacherCreateLectureUseCase(repo);
      await assert.rejects(
        async () => {
          await useCase.execute("teacher_profile_1", {
            courseId: "non_existent_course",
            title: "Lecture",
          });
        },
        (err: any) => err instanceof LectureNotFoundError && err.message.includes("not found")
      );
    });

    it("throws LectureAccessDeniedError when teacher does not own course (IDOR guard)", async () => {
      const useCase = new TeacherCreateLectureUseCase(repo);
      await assert.rejects(
        async () => {
          // teacher_profile_2 attempts to create a lecture in teacher_profile_1's course_1
          await useCase.execute("teacher_profile_2", {
            courseId: "course_1",
            title: "Unauthorized Lecture",
          });
        },
        (err: any) =>
          err instanceof LectureAccessDeniedError &&
          err.message.includes("do not have permission")
      );
    });

    it("detects schedule overlap and throws LectureConflictError", async () => {
      const useCase = new TeacherCreateLectureUseCase(repo);
      const slotStart = new Date("2026-11-25T10:00:00Z");

      // 1. Create first lecture: 10:00 to 11:30 (5400s)
      await useCase.execute("teacher_profile_1", {
        courseId: "course_1",
        title: "Lecture Slot 1",
        scheduledAt: slotStart,
        durationSeconds: 5400,
      });

      // 2. Attempt to create second lecture for same teacher overlapping from 10:30 to 11:30
      const overlappingStart = new Date("2026-11-25T10:30:00Z");
      await assert.rejects(
        async () => {
          await useCase.execute("teacher_profile_1", {
            courseId: "course_1",
            title: "Overlapping Lecture",
            scheduledAt: overlappingStart,
            durationSeconds: 3600,
          });
        },
        (err: any) =>
          err instanceof LectureConflictError && err.message.includes("Schedule conflict")
      );
    });

    it("permits scheduling non-overlapping consecutive lectures", async () => {
      const useCase = new TeacherCreateLectureUseCase(repo);
      const slot1Start = new Date("2026-11-25T10:00:00Z");
      const slot2Start = new Date("2026-11-25T11:00:00Z"); // Right after 10:00-11:00

      const lec1 = await useCase.execute("teacher_profile_1", {
        courseId: "course_1",
        title: "Lecture A",
        scheduledAt: slot1Start,
        durationSeconds: 3600,
      });

      const lec2 = await useCase.execute("teacher_profile_1", {
        courseId: "course_1",
        title: "Lecture B",
        scheduledAt: slot2Start,
        durationSeconds: 3600,
      });

      assert.ok(lec1.id);
      assert.ok(lec2.id);
      assert.notEqual(lec1.id, lec2.id);
    });
  });

  // --------------------------------------------------------------------------
  // SUITE 3: Teacher Lecture Update, Detail & Soft Deletion
  // --------------------------------------------------------------------------
  describe("3. Teacher Lecture Update, Detail & Deletion", () => {
    let existingLecture: LectureEntity;

    beforeEach(async () => {
      const createUseCase = new TeacherCreateLectureUseCase(repo);
      existingLecture = await createUseCase.execute("teacher_profile_1", {
        courseId: "course_1",
        title: "Original Title",
        description: "Original Description",
        scheduledAt: new Date("2026-11-26T14:00:00Z"),
        durationSeconds: 3600,
      });
    });

    it("successfully updates lecture title, description and duration", async () => {
      const updateUseCase = new TeacherUpdateLectureUseCase(repo);
      const updated = await updateUseCase.execute("teacher_profile_1", existingLecture.id, {
        title: "Updated Clean Title",
        description: "Updated Content",
        durationSeconds: 4800,
      });

      assert.equal(updated.title, "Updated Clean Title");
      assert.equal(updated.description, "Updated Content");
      assert.equal(updated.durationSeconds, 4800);
    });

    it("rejects update when teacher does not own the lecture (IDOR guard)", async () => {
      const updateUseCase = new TeacherUpdateLectureUseCase(repo);
      await assert.rejects(
        async () => {
          await updateUseCase.execute("teacher_profile_2", existingLecture.id, {
            title: "Hacked Title",
          });
        },
        (err: any) =>
          err instanceof LectureAccessDeniedError &&
          err.message.includes("do not have permission")
      );
    });

    it("excludes self when checking scheduling conflicts on update", async () => {
      const updateUseCase = new TeacherUpdateLectureUseCase(repo);
      // Updating duration from 3600 to 4000 at the same start time shouldn't conflict with itself
      const updated = await updateUseCase.execute("teacher_profile_1", existingLecture.id, {
        durationSeconds: 4000,
      });
      assert.equal(updated.durationSeconds, 4000);
    });

    it("successfully retrieves lecture details for owner teacher", async () => {
      const detailUseCase = new TeacherGetLectureDetailUseCase(repo);
      const detail = await detailUseCase.execute("teacher_profile_1", existingLecture.id);
      assert.equal(detail.id, existingLecture.id);
      assert.equal(detail.title, "Original Title");
    });

    it("rejects get detail for unauthenticated / unauthorized teacher", async () => {
      const detailUseCase = new TeacherGetLectureDetailUseCase(repo);
      await assert.rejects(
        async () => {
          await detailUseCase.execute("teacher_profile_2", existingLecture.id);
        },
        (err: any) => err instanceof LectureAccessDeniedError
      );
    });

    it("successfully soft-deletes lecture for owning teacher", async () => {
      const deleteUseCase = new TeacherDeleteLectureUseCase(repo);
      const result = await deleteUseCase.execute("teacher_profile_1", existingLecture.id);
      assert.equal(result, true);

      // Verify soft deletion state
      const found = await repo.findById(existingLecture.id);
      assert.equal(found, null); // Hidden by default

      const raw = await repo.findById(existingLecture.id, true);
      assert.ok(raw?.isDeleted);
    });

    it("rejects soft-deletion from unauthorized teacher", async () => {
      const deleteUseCase = new TeacherDeleteLectureUseCase(repo);
      await assert.rejects(
        async () => {
          await deleteUseCase.execute("teacher_profile_2", existingLecture.id);
        },
        (err: any) => err instanceof LectureAccessDeniedError
      );
    });
  });

  // --------------------------------------------------------------------------
  // SUITE 4: Student Lecture Access & IDOR Guards
  // --------------------------------------------------------------------------
  describe("4. Student Lecture Access & Progress Context", () => {
    let lecture: LectureEntity;

    beforeEach(async () => {
      const createUseCase = new TeacherCreateLectureUseCase(repo);
      lecture = await createUseCase.execute("teacher_profile_1", {
        courseId: "course_1",
        title: "Student Accessible Lecture",
        scheduledAt: new Date("2026-11-28T16:00:00Z"),
      });
    });

    it("returns lecture with progress context when student is actively enrolled", async () => {
      // Setup active enrollment
      repo.studentAccess.set(`student_123:course_1:${lecture.id}`, {
        hasActiveEnrollment: true,
        attendedLive: true,
        isCompleted: false,
      });

      const useCase = new StudentGetLectureDetailUseCase(repo);
      const result = await useCase.execute("student_123", lecture.id);

      assert.equal(result.id, lecture.id);
      assert.equal(result.attendedLive, true);
      assert.equal(result.isCompleted, false);
    });

    it("rejects access with LectureAccessDeniedError when student is not enrolled", async () => {
      const useCase = new StudentGetLectureDetailUseCase(repo);
      await assert.rejects(
        async () => {
          await useCase.execute("unregistered_student", lecture.id);
        },
        (err: any) =>
          err instanceof LectureAccessDeniedError &&
          err.message.includes("actively enrolled")
      );
    });

    it("rejects access with LectureNotFoundError if lecture is soft deleted", async () => {
      await repo.softDeleteLecture(lecture.id);

      repo.studentAccess.set(`student_123:course_1:${lecture.id}`, {
        hasActiveEnrollment: true,
        attendedLive: false,
        isCompleted: false,
      });

      const useCase = new StudentGetLectureDetailUseCase(repo);
      await assert.rejects(
        async () => {
          await useCase.execute("student_123", lecture.id);
        },
        (err: any) => err instanceof LectureNotFoundError
      );
    });
  });

  // --------------------------------------------------------------------------
  // SUITE 5: Admin Lecture Access & Listing
  // --------------------------------------------------------------------------
  describe("5. Admin Lecture Access", () => {
    it("admin can access any lecture regardless of teacher ownership", async () => {
      const createUseCase = new TeacherCreateLectureUseCase(repo);
      const lec = await createUseCase.execute("teacher_profile_1", {
        courseId: "course_1",
        title: "Admin Oversight Lecture",
      });

      const adminDetailUseCase = new AdminGetLectureDetailUseCase(repo);
      const result = await adminDetailUseCase.execute(lec.id);
      assert.equal(result.id, lec.id);
      assert.equal(result.title, "Admin Oversight Lecture");
    });

    it("admin listing returns paginated results across all teachers", async () => {
      const createUseCase = new TeacherCreateLectureUseCase(repo);
      await createUseCase.execute("teacher_profile_1", {
        courseId: "course_1",
        title: "Course 1 Lec",
      });
      await createUseCase.execute("teacher_profile_2", {
        courseId: "course_2",
        title: "Course 2 Lec",
      });

      const adminListUseCase = new AdminGetLecturesUseCase(repo);
      const list = await adminListUseCase.execute({ page: 1, limit: 10 });
      assert.ok(list.total >= 2);
      assert.ok(list.lectures.some((l) => l.title === "Course 1 Lec"));
      assert.ok(list.lectures.some((l) => l.title === "Course 2 Lec"));
    });
  });

  // --------------------------------------------------------------------------
  // SUITE 6: Presentation Schemas & Zod Validation
  // --------------------------------------------------------------------------
  describe("6. Presentation Schemas & Input Validation", () => {
    it("validates createLectureBodySchema accepts valid payload", () => {
      const parsed = createLectureBodySchema.parse({
        courseId: "123e4567-e89b-12d3-a456-426614174000",
        title: "Valid Lecture Title",
        durationSeconds: 3600,
      });
      assert.equal(parsed.title, "Valid Lecture Title");
      assert.equal(parsed.durationSeconds, 3600);
    });

    it("rejects createLectureBodySchema with non-uuid courseId", () => {
      assert.throws(() => {
        createLectureBodySchema.parse({
          courseId: "not-a-uuid",
          title: "Valid Title",
        });
      });
    });

    it("rejects createLectureBodySchema with title < 2 chars", () => {
      assert.throws(() => {
        createLectureBodySchema.parse({
          courseId: "123e4567-e89b-12d3-a456-426614174000",
          title: "A",
        });
      });
    });

    it("validates updateLectureBodySchema allows partial updates", () => {
      const parsed = updateLectureBodySchema.parse({
        title: "Updated Title Only",
      });
      assert.equal(parsed.title, "Updated Title Only");
    });

    it("parses and transforms lectureQueryObjectSchema page and limit to numbers", () => {
      const parsed = lectureQueryObjectSchema.parse({
        page: "2",
        limit: "25",
        sort: "startTime-asc",
      });
      assert.equal(parsed.page, 2);
      assert.equal(parsed.limit, 25);
      assert.equal(parsed.sort, "startTime-asc");
    });
  });

  // --------------------------------------------------------------------------
  // SUITE 7: Dependency Inversion & Module Factory
  // --------------------------------------------------------------------------
  describe("7. Dependency Inversion Module Factory", () => {
    it("createLectureModule instantiates cleanly with custom injected dependencies", () => {
      const customRepo = new InMemoryLectureRepository();
      const customResolver = new MockTeacherProfileResolver();

      const moduleInstance = createLectureModule({
        lectureRepo: customRepo,
        teacherProfileResolver: customResolver,
      });

      assert.ok(moduleInstance.lectureRouter);
      assert.ok(moduleInstance.lectureRepo);
      assert.ok(moduleInstance.lectureController);
      assert.ok(moduleInstance.useCases.teacherCreateLectureUseCase);
      assert.ok(moduleInstance.useCases.studentGetLectureDetailUseCase);
      assert.ok(moduleInstance.useCases.adminGetLecturesUseCase);
    });
  });
});
