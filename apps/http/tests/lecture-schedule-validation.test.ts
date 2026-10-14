import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { TeacherCreateLectureUseCase } from "../src/modules/lecture/application/use-cases/teacher-create-lecture.usecase";
import { TeacherUpdateLectureUseCase } from "../src/modules/lecture/application/use-cases/teacher-update-lecture.usecase";
import { ILectureRepository } from "../src/modules/lecture/domain/repositories/lecture.repository";
import { LectureEntity } from "../src/modules/lecture/domain/entities/lecture.entity";
import { BadRequestError } from "../src/app/errors";

function createMockLectureRepo(overrides: Partial<ILectureRepository> = {}): ILectureRepository {
  return {
    findById: async () => null,
    findManyTeacherLectures: async () => ({ items: [], total: 0, page: 1, limit: 10, totalPages: 0 }),
    findManyAdminLectures: async () => ({ items: [], total: 0, page: 1, limit: 10, totalPages: 0 }),
    findManyStudentLectures: async () => ({ items: [], total: 0, page: 1, limit: 10, totalPages: 0 }),
    findConflictingLecture: async () => null,
    createLecture: async (courseId, moduleId, data) =>
      ({
        id: "lecture-123",
        moduleId,
        title: data.title,
        description: data.description ?? null,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        durationSeconds: data.durationSeconds ?? 3600,
        sortOrder: 0,
        liveStatus: "SCHEDULED",
        isLiveNow: false,
        isPublished: true,
        isDeleted: false,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        courseId,
      } as LectureEntity),
    updateLecture: async (id, data) =>
      ({
        id,
        moduleId: "mod-1",
        title: data.title ?? "Existing Lecture",
        description: data.description ?? null,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        durationSeconds: data.durationSeconds ?? 3600,
        sortOrder: 0,
        liveStatus: data.liveStatus ?? "SCHEDULED",
        isLiveNow: false,
        isPublished: true,
        isDeleted: false,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as LectureEntity),
    softDeleteLecture: async () => true,
    findCourseWithDefaultModule: async () => null,
    ...overrides,
  };
}

describe("Lecture Course Starting Date Validation", () => {
  const teacherProfileId = "teacher-profile-1";
  const courseId = "course-abc";
  const futureCourseStart = new Date("2026-11-15T00:00:00.000Z");

  describe("TeacherCreateLectureUseCase", () => {
    it("should throw BadRequestError if lecture start time is earlier than future course start date", async () => {
      const mockRepo = createMockLectureRepo({
        findCourseWithDefaultModule: async (id) => ({
          id,
          teacherProfileId,
          defaultModuleId: "module-1",
          startingDate: futureCourseStart,
          title: "Full Stack Mastery",
        }),
      });

      const useCase = new TeacherCreateLectureUseCase(mockRepo);

      // Attempt to schedule earlier than Nov 15 (e.g. Nov 10, 2026)
      await assert.rejects(
        async () => {
          await useCase.execute(teacherProfileId, {
            courseId,
            title: "Introductory Live Lecture",
            scheduledAt: new Date("2026-11-10T10:00:00.000Z"),
            durationSeconds: 3600,
          });
        },
        (err: any) => {
          assert.ok(err instanceof BadRequestError);
          assert.match(err.message, /cannot be earlier than the course start date/i);
          return true;
        }
      );
    });

    it("should allow scheduling a lecture on or after the future course start date", async () => {
      const mockRepo = createMockLectureRepo({
        findCourseWithDefaultModule: async (id) => ({
          id,
          teacherProfileId,
          defaultModuleId: "module-1",
          startingDate: futureCourseStart,
          title: "Full Stack Mastery",
        }),
      });

      const useCase = new TeacherCreateLectureUseCase(mockRepo);

      // Schedule exactly on or after the start date (Nov 15, 2026 at 10:00 AM)
      const lecture = await useCase.execute(teacherProfileId, {
        courseId,
        title: "Session 1: Architecture",
        scheduledAt: new Date("2026-11-15T10:00:00.000Z"),
        durationSeconds: 3600,
      });

      assert.equal(lecture.title, "Session 1: Architecture");
      assert.ok(lecture.scheduledAt);
      assert.equal(lecture.scheduledAt.toISOString(), "2026-11-15T10:00:00.000Z");
    });

    it("should allow scheduling when the course has no start date (self-paced)", async () => {
      const mockRepo = createMockLectureRepo({
        findCourseWithDefaultModule: async (id) => ({
          id,
          teacherProfileId,
          defaultModuleId: "module-1",
          startingDate: null,
          title: "Self-Paced Course",
        }),
      });

      const useCase = new TeacherCreateLectureUseCase(mockRepo);

      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const lecture = await useCase.execute(teacherProfileId, {
        courseId,
        title: "Live Q&A",
        scheduledAt: nextWeek,
        durationSeconds: 3600,
      });

      assert.equal(lecture.title, "Live Q&A");
    });
  });

  describe("TeacherUpdateLectureUseCase", () => {
    it("should throw BadRequestError if updating lecture scheduledAt to earlier than course start date", async () => {
      const mockRepo = createMockLectureRepo({
        findById: async (id) => ({
          id,
          moduleId: "module-1",
          title: "Existing Lecture",
          description: null,
          scheduledAt: new Date("2026-11-20T10:00:00.000Z"),
          durationSeconds: 3600,
          sortOrder: 0,
          liveStatus: "SCHEDULED",
          isLiveNow: false,
          isPublished: true,
          isDeleted: false,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          teacherId: teacherProfileId,
          courseId,
          courseStartingDate: futureCourseStart,
        }),
      });

      const useCase = new TeacherUpdateLectureUseCase(mockRepo);

      // Attempt to reschedule to earlier than Nov 15
      await assert.rejects(
        async () => {
          await useCase.execute(teacherProfileId, "lecture-123", {
            scheduledAt: new Date("2026-11-05T10:00:00.000Z"),
          });
        },
        (err: any) => {
          assert.ok(err instanceof BadRequestError);
          assert.match(err.message, /cannot be earlier than the course start date/i);
          return true;
        }
      );
    });

    it("should allow updating lecture scheduledAt to a valid date on or after course start date", async () => {
      const mockRepo = createMockLectureRepo({
        findById: async (id) => ({
          id,
          moduleId: "module-1",
          title: "Existing Lecture",
          description: null,
          scheduledAt: new Date("2026-11-20T10:00:00.000Z"),
          durationSeconds: 3600,
          sortOrder: 0,
          liveStatus: "SCHEDULED",
          isLiveNow: false,
          isPublished: true,
          isDeleted: false,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          teacherId: teacherProfileId,
          courseId,
          courseStartingDate: futureCourseStart,
        }),
      });

      const useCase = new TeacherUpdateLectureUseCase(mockRepo);

      const validNewTime = new Date("2026-11-18T14:00:00.000Z");
      const updated = await useCase.execute(teacherProfileId, "lecture-123", {
        scheduledAt: validNewTime,
      });

      assert.ok(updated);
    });
  });
});
