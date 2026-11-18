import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  CourseEntity,
  CourseModuleEntity,
  CourseLessonEntity,
  CourseFilterParams,
  CourseMetrics,
  isCoursePubliclyVisible,
  isCourseEditableByTeacher,
  canCourseBeDelisted,
  GetCoursesUseCase,
  TeacherCourseUseCase,
  AdminManageCoursesUseCase,
  ICourseRepository,
  ICurriculumRepository,
  ICourseNotificationService,
  ITeacherProfileResolver,
  CreateCourseDTO,
  UpdateCourseDTO,
  CreateModuleDTO,
  UpdateModuleDTO,
  CreateLessonDTO,
  UpdateLessonDTO,
  ReorderItemDTO,
  CourseStatusUpdateExtras,
  createCourseModule,
  UpdateCourseController,
  CreateCourseController,
  AdminDelistCourseController,
  AdminFreezeCourseController,
  AdminGetAllCoursesController,
  teacherUpdateCourseSchema,
} from "../src/modules/course";
import { BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError } from "../src/app/errors";

// ============================================================================
// IN-MEMORY MOCK REPOSITORIES & SERVICES
// ============================================================================

class MockCourseRepository implements ICourseRepository {
  public courses: Map<string, CourseEntity> = new Map();

  async findById(id: string, includeDeleted = false, includeCurriculum = false): Promise<CourseEntity | null> {
    const course = this.courses.get(id);
    if (!course) return null;
    if (!includeDeleted && course.isDeleted) return null;
    return { ...course };
  }

  async findBySlug(slug: string, includeDeleted = false, includeCurriculum = false): Promise<CourseEntity | null> {
    for (const c of this.courses.values()) {
      if (c.slug === slug || c.id === slug) {
        if (!includeDeleted && c.isDeleted) return null;
        return { ...c };
      }
    }
    return null;
  }

  async findMany(params: CourseFilterParams = {}): Promise<{ items: CourseEntity[]; total: number; page?: number; limit?: number; totalPages: number }> {
    let items = Array.from(this.courses.values());

    if (params.isDeleted !== undefined) {
      items = items.filter((c) => c.isDeleted === params.isDeleted);
    } else if (!params.includeDeleted) {
      items = items.filter((c) => !c.isDeleted);
    }

    if (params.status) {
      items = items.filter((c) => c.status === params.status);
    }
    if (params.teacherProfileId) {
      items = items.filter((c) => c.teacherProfileId === params.teacherProfileId);
    }
    if (params.categoryId) {
      items = items.filter((c) => c.categoryId === params.categoryId);
    }
    if (params.isFeatured !== undefined) {
      items = items.filter((c) => c.isFeatured === params.isFeatured);
    }
    if (params.isTrending !== undefined) {
      items = items.filter((c) => c.isTrending === params.isTrending);
    }
    if (params.isFrozen !== undefined) {
      items = items.filter((c) => c.isFrozen === params.isFrozen);
    }

    return {
      items,
      total: items.length,
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      totalPages: 1,
    };
  }

  async create(data: CreateCourseDTO): Promise<CourseEntity> {
    const id = `crs_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const course: CourseEntity = {
      id,
      title: data.title,
      slug: data.slug || `${data.title.toLowerCase().replace(/\s+/g, "-")}-${Math.random().toString(36).substring(2, 6)}`,
      subtitle: data.subtitle ?? null,
      description: data.description ?? null,
      thumbnail: data.thumbnail ?? null,
      promoVideoUrl: data.promoVideoUrl ?? null,
      startingDate: data.startingDate ? new Date(data.startingDate) : null,
      level: data.level || "ALL_LEVELS",
      language: data.language || "English",
      pricingType: data.pricingType || "FREE",
      price: data.pricingType === "FREE" ? 0 : data.price || 0,
      currency: data.currency || "INR",
      learningOutcomes: data.learningOutcomes || [],
      requirements: data.requirements || [],
      targetAudience: data.targetAudience || [],
      tags: data.tags || [],
      teacherProfileId: data.teacherProfileId,
      categoryId: data.categoryId,
      subcategoryId: data.subcategoryId ?? null,
      status: data.status || "PUBLISHED",
      delistReason: null,
      delistedAt: null,
      freezeReason: null,
      isFrozen: false,
      frozenAt: null,
      publishedAt: new Date(),
      isApproved: true,
      totalDurationSeconds: 0,
      totalLessons: 0,
      totalModules: 0,
      isFeatured: false,
      isTrending: false,
      sortOrder: 0,
      isDeleted: false,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      teacherProfile: {
        profile: {
          user: {
            id: "usr_teacher_1",
            name: "Instructor Alice",
            email: "alice@coursity.io",
          },
        },
      },
    };
    this.courses.set(id, course);
    return { ...course };
  }

  async update(id: string, data: UpdateCourseDTO): Promise<CourseEntity> {
    const existing = this.courses.get(id);
    if (!existing) throw new NotFoundError("Course not found");
    const updated: CourseEntity = {
      ...existing,
      ...data,
      price: data.pricingType === "FREE" ? 0 : data.price ?? existing.price,
      updatedAt: new Date(),
    };
    this.courses.set(id, updated);
    return { ...updated };
  }

  async updateStatus(id: string, status: CourseEntity["status"], extras: CourseStatusUpdateExtras = {}): Promise<CourseEntity> {
    const existing = this.courses.get(id);
    if (!existing) throw new NotFoundError("Course not found");
    const updated: CourseEntity = {
      ...existing,
      status,
      delistReason: extras.delistReason ?? existing.delistReason,
      freezeReason: extras.freezeReason ?? existing.freezeReason,
      isApproved: extras.isApproved ?? existing.isApproved,
      publishedAt: extras.publishedAt ?? existing.publishedAt,
      updatedAt: new Date(),
    };
    this.courses.set(id, updated);
    return { ...updated };
  }

  async softDelete(id: string, delistReason?: string): Promise<CourseEntity> {
    const existing = this.courses.get(id);
    if (!existing) throw new NotFoundError("Course not found");
    const updated: CourseEntity = {
      ...existing,
      isDeleted: true,
      deletedAt: new Date(),
      status: "ARCHIVED",
      delistReason: delistReason ?? existing.delistReason,
      delistedAt: delistReason ? new Date() : existing.delistedAt,
      updatedAt: new Date(),
    };
    this.courses.set(id, updated);
    return { ...updated };
  }

  async restore(id: string): Promise<CourseEntity> {
    const existing = this.courses.get(id);
    if (!existing) throw new NotFoundError("Course not found");
    const updated: CourseEntity = {
      ...existing,
      isDeleted: false,
      deletedAt: null,
      status: "PUBLISHED",
      isApproved: true,
      delistReason: null,
      delistedAt: null,
      isFrozen: false,
      freezeReason: null,
      frozenAt: null,
      updatedAt: new Date(),
    };
    this.courses.set(id, updated);
    return { ...updated };
  }

  async freeze(id: string, freezeReason: string): Promise<CourseEntity> {
    const existing = this.courses.get(id);
    if (!existing) throw new NotFoundError("Course not found");
    const updated: CourseEntity = {
      ...existing,
      isFrozen: true,
      frozenAt: new Date(),
      freezeReason,
      status: "FROZEN",
      updatedAt: new Date(),
    };
    this.courses.set(id, updated);
    return { ...updated };
  }

  async unfreeze(id: string): Promise<CourseEntity> {
    const existing = this.courses.get(id);
    if (!existing) throw new NotFoundError("Course not found");
    const updated: CourseEntity = {
      ...existing,
      isFrozen: false,
      frozenAt: null,
      freezeReason: null,
      status: "PUBLISHED",
      updatedAt: new Date(),
    };
    this.courses.set(id, updated);
    return { ...updated };
  }

  async hardDelete(id: string): Promise<boolean> {
    return this.courses.delete(id);
  }

  async getMetrics(teacherProfileId?: string): Promise<CourseMetrics> {
    const all = Array.from(this.courses.values()).filter((c) =>
      teacherProfileId ? c.teacherProfileId === teacherProfileId : true
    );
    return {
      total: all.length,
      published: all.filter((c) => c.status === "PUBLISHED" && !c.isDeleted).length,
      draft: all.filter((c) => c.status === "DRAFT" && !c.isDeleted).length,
      archived: all.filter((c) => c.isDeleted || c.status === "ARCHIVED").length,
      frozen: all.filter((c) => c.isFrozen).length,
      featured: all.filter((c) => c.isFeatured && !c.isDeleted).length,
      freeCourses: all.filter((c) => c.pricingType === "FREE" && !c.isDeleted).length,
      paidCourses: all.filter((c) => c.pricingType === "PAID" && !c.isDeleted).length,
    };
  }

  async countByTeacher(teacherProfileId: string, status?: CourseEntity["status"]): Promise<number> {
    return Array.from(this.courses.values()).filter(
      (c) => c.teacherProfileId === teacherProfileId && (!status || c.status === status) && !c.isDeleted
    ).length;
  }

  // Base repository methods
  async delete(id: string): Promise<boolean> {
    return this.hardDelete(id);
  }
}

class MockCurriculumRepository implements ICurriculumRepository {
  public modules: Map<string, CourseModuleEntity> = new Map();
  public lessons: Map<string, CourseLessonEntity> = new Map();

  async findModuleById(id: string, includeLessons = true): Promise<CourseModuleEntity | null> {
    const mod = this.modules.get(id);
    if (!mod) return null;
    const lessons = Array.from(this.lessons.values()).filter((l) => l.moduleId === id && !l.isDeleted);
    return { ...mod, lessons };
  }

  async getModulesByCourseId(courseId: string, includeLessons = true): Promise<CourseModuleEntity[]> {
    const mods = Array.from(this.modules.values()).filter((m) => m.courseId === courseId);
    return mods.map((m) => ({
      ...m,
      lessons: Array.from(this.lessons.values()).filter((l) => l.moduleId === m.id && !l.isDeleted),
    }));
  }

  async createModule(data: CreateModuleDTO): Promise<CourseModuleEntity> {
    const id = `mod_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const mod: CourseModuleEntity = {
      id,
      courseId: data.courseId,
      title: data.title,
      description: data.description ?? null,
      sortOrder: data.sortOrder ?? 0,
      isPublished: data.isPublished ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lessons: [],
    };
    this.modules.set(id, mod);
    return { ...mod };
  }

  async updateModule(id: string, data: UpdateModuleDTO): Promise<CourseModuleEntity> {
    const mod = this.modules.get(id);
    if (!mod) throw new NotFoundError("Module not found");
    const updated = { ...mod, ...data, updatedAt: new Date() };
    this.modules.set(id, updated);
    return { ...updated };
  }

  async deleteModule(id: string): Promise<boolean> {
    return this.modules.delete(id);
  }

  async reorderModules(courseId: string, items: ReorderItemDTO[]): Promise<void> {
    for (const item of items) {
      const mod = this.modules.get(item.id);
      if (mod) mod.sortOrder = item.sortOrder;
    }
  }

  async findLessonById(id: string): Promise<CourseLessonEntity | null> {
    const les = this.lessons.get(id);
    if (!les || les.isDeleted) return null;
    return { ...les };
  }

  async getLessonsByModuleId(moduleId: string): Promise<CourseLessonEntity[]> {
    return Array.from(this.lessons.values()).filter((l) => l.moduleId === moduleId && !l.isDeleted);
  }

  async createLesson(data: CreateLessonDTO): Promise<CourseLessonEntity> {
    const id = `les_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const les: CourseLessonEntity = {
      id,
      moduleId: data.moduleId,
      title: data.title,
      description: data.description ?? null,
      durationSeconds: data.durationSeconds ?? 0,
      sortOrder: data.sortOrder ?? 0,
      isPublished: data.isPublished ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.lessons.set(id, les);
    return { ...les };
  }

  async updateLesson(id: string, data: UpdateLessonDTO): Promise<CourseLessonEntity> {
    const les = this.lessons.get(id);
    if (!les) throw new NotFoundError("Lesson not found");
    const updated = { ...les, ...data, updatedAt: new Date() };
    this.lessons.set(id, updated);
    return { ...updated };
  }

  async deleteLesson(id: string): Promise<boolean> {
    const les = this.lessons.get(id);
    if (!les) return false;
    les.isDeleted = true;
    les.deletedAt = new Date();
    return true;
  }

  async reorderLessons(moduleId: string, items: ReorderItemDTO[]): Promise<void> {
    for (const item of items) {
      const les = this.lessons.get(item.id);
      if (les) les.sortOrder = item.sortOrder;
    }
  }

  async recalculateCourseAggregates(courseId: string): Promise<void> {
    // Mock recalculation
  }
}

class MockNotificationService implements ICourseNotificationService {
  public delistedEmails: Array<{ email: string; title: string; reason: string }> = [];
  public frozenEmails: Array<{ email: string; title: string; reason: string }> = [];

  async sendCourseDelistedNotification(
    email: string,
    teacherName: string,
    courseTitle: string,
    reason: string,
    courseSlug: string
  ): Promise<void> {
    this.delistedEmails.push({ email, title: courseTitle, reason });
  }

  async sendCourseFrozenNotification(
    email: string,
    teacherName: string,
    courseTitle: string,
    reason: string,
    courseSlug: string
  ): Promise<void> {
    this.frozenEmails.push({ email, title: courseTitle, reason });
  }
}

class MockTeacherProfileResolver implements ITeacherProfileResolver {
  public mappings: Map<string, string> = new Map();

  async getTeacherProfileIdByUserId(userId: string): Promise<string> {
    const profileId = this.mappings.get(userId);
    if (!profileId) {
      return `tp_auto_${userId}`;
    }
    return profileId;
  }
}

// ============================================================================
// TEST SUITE: COURSE CLEAN ARCHITECTURE & SECURITY
// ============================================================================

describe("Course Module - Clean Architecture & SOLID Compliance", () => {
  // --------------------------------------------------------------------------
  // 1. PUBLIC DISCOVERY & BUG FIX TEST
  // --------------------------------------------------------------------------
  describe("Public Course Discovery (GetCoursesUseCase)", () => {
    it("should return only published and non-deleted courses", async () => {
      const repo = new MockCourseRepository();
      const useCase = new GetCoursesUseCase(repo);

      await repo.create({ title: "Public Course 1", teacherProfileId: "tp_1", categoryId: "cat_1" });
      const draft = await repo.create({ title: "Draft Course", teacherProfileId: "tp_1", categoryId: "cat_1" });
      await repo.update(draft.id, { status: "DRAFT" });

      const { items } = await useCase.getPublicCourses();
      assert.strictEqual(items.length, 1);
      assert.strictEqual(items[0].title, "Public Course 1");
    });

    it("should hide DRAFT, FROZEN, ARCHIVED, or deleted courses when queried by slug (CRITICAL BUG FIX)", async () => {
      const repo = new MockCourseRepository();
      const useCase = new GetCoursesUseCase(repo);

      const pub = await repo.create({ title: "Public Course", slug: "pub-course", teacherProfileId: "tp_1", categoryId: "cat_1" });
      const draft = await repo.create({ title: "Draft Course", slug: "draft-course", teacherProfileId: "tp_1", categoryId: "cat_1" });
      await repo.update(draft.id, { status: "DRAFT" });

      const frozen = await repo.create({ title: "Frozen Course", slug: "frozen-course", teacherProfileId: "tp_1", categoryId: "cat_1" });
      await repo.freeze(frozen.id, "Violation of terms");

      const deleted = await repo.create({ title: "Deleted Course", slug: "deleted-course", teacherProfileId: "tp_1", categoryId: "cat_1" });
      await repo.softDelete(deleted.id);

      // Public course succeeds
      const fetched = await useCase.getCourseBySlug("pub-course");
      assert.strictEqual(fetched.id, pub.id);

      // Draft course throws NotFoundError
      await assert.rejects(
        () => useCase.getCourseBySlug("draft-course"),
        (err: any) => err instanceof NotFoundError
      );

      // Frozen course throws NotFoundError
      await assert.rejects(
        () => useCase.getCourseBySlug("frozen-course"),
        (err: any) => err instanceof NotFoundError
      );

      // Deleted course throws NotFoundError
      await assert.rejects(
        () => useCase.getCourseBySlug("deleted-course"),
        (err: any) => err instanceof NotFoundError
      );
    });

    it("should return featured and trending courses correctly", async () => {
      const repo = new MockCourseRepository();
      const useCase = new GetCoursesUseCase(repo);

      const c1 = await repo.create({ title: "Featured Course", teacherProfileId: "tp_1", categoryId: "cat_1" });
      await repo.update(c1.id, { isFeatured: true });

      const c2 = await repo.create({ title: "Trending Course", teacherProfileId: "tp_1", categoryId: "cat_1" });
      await repo.update(c2.id, { isTrending: true });

      const featured = await useCase.getFeaturedCourses();
      assert.strictEqual(featured.length, 1);
      assert.strictEqual(featured[0].title, "Featured Course");

      const trending = await useCase.getTrendingCourses();
      assert.strictEqual(trending.length, 1);
      assert.strictEqual(trending[0].title, "Trending Course");
    });
  });

  // --------------------------------------------------------------------------
  // 2. TEACHER COURSE STUDIO & PRIVILEGE ESCALATION FIX
  // --------------------------------------------------------------------------
  describe("Teacher Studio Operations (TeacherCourseUseCase)", () => {
    it("should allow a teacher to create and list their own courses", async () => {
      const courseRepo = new MockCourseRepository();
      const curriculumRepo = new MockCurriculumRepository();
      const useCase = new TeacherCourseUseCase(courseRepo, curriculumRepo);

      const created = await useCase.createCourse({
        title: "Node.js Mastery",
        teacherProfileId: "tp_alice",
        categoryId: "cat_backend",
      });

      assert.strictEqual(created.title, "Node.js Mastery");
      assert.strictEqual(created.teacherProfileId, "tp_alice");

      const { items } = await useCase.getTeacherCourses("tp_alice");
      assert.strictEqual(items.length, 1);
      assert.strictEqual(items[0].id, created.id);
    });

    it("should prevent a teacher from updating another teacher's course (IDOR prevention)", async () => {
      const courseRepo = new MockCourseRepository();
      const curriculumRepo = new MockCurriculumRepository();
      const useCase = new TeacherCourseUseCase(courseRepo, curriculumRepo);

      const aliceCourse = await useCase.createCourse({
        title: "Alice's Course",
        teacherProfileId: "tp_alice",
        categoryId: "cat_1",
      });

      await assert.rejects(
        () => useCase.updateCourse("tp_bob", aliceCourse.id, { title: "Hacked by Bob" }),
        (err: any) => err instanceof ForbiddenError
      );
    });

    it("should strip administrative flags (isFeatured, isTrending, sortOrder) on teacher update (CRITICAL SECURITY FIX)", async () => {
      const courseRepo = new MockCourseRepository();
      const curriculumRepo = new MockCurriculumRepository();
      const useCase = new TeacherCourseUseCase(courseRepo, curriculumRepo);

      const course = await useCase.createCourse({
        title: "Basic Course",
        teacherProfileId: "tp_alice",
        categoryId: "cat_1",
      });

      // Teacher attempts to self-promote to featured and trending
      const updated = await useCase.updateCourse("tp_alice", course.id, {
        title: "Updated Title",
        isFeatured: true,
        isTrending: true,
        sortOrder: 999,
      } as any);

      assert.strictEqual(updated.title, "Updated Title");
      assert.strictEqual(updated.isFeatured, false, "Teacher must not be able to set isFeatured");
      assert.strictEqual(updated.isTrending, false, "Teacher must not be able to set isTrending");
      assert.strictEqual(updated.sortOrder, 0, "Teacher must not be able to set sortOrder");
    });

    it("should block teacher modifications and deletions if course is FROZEN", async () => {
      const courseRepo = new MockCourseRepository();
      const curriculumRepo = new MockCurriculumRepository();
      const useCase = new TeacherCourseUseCase(courseRepo, curriculumRepo);

      const course = await useCase.createCourse({
        title: "Policy Violating Course",
        teacherProfileId: "tp_alice",
        categoryId: "cat_1",
      });

      await courseRepo.freeze(course.id, "Under investigation");

      await assert.rejects(
        () => useCase.updateCourse("tp_alice", course.id, { title: "Attempted Edit" }),
        (err: any) => err instanceof ForbiddenError && err.message.includes("frozen")
      );

      await assert.rejects(
        () => useCase.deleteCourse("tp_alice", course.id),
        (err: any) => err instanceof ForbiddenError && err.message.includes("frozen")
      );
    });
  });

  // --------------------------------------------------------------------------
  // 3. CURRICULUM MANAGEMENT (MODULES & LESSONS)
  // --------------------------------------------------------------------------
  describe("Curriculum Management", () => {
    it("should allow a teacher to create, update, reorder, and delete modules and lessons", async () => {
      const courseRepo = new MockCourseRepository();
      const curriculumRepo = new MockCurriculumRepository();
      const useCase = new TeacherCourseUseCase(courseRepo, curriculumRepo);

      const course = await useCase.createCourse({
        title: "Fullstack Architecture",
        teacherProfileId: "tp_alice",
        categoryId: "cat_1",
      });

      // 1. Create Module
      const mod1 = await useCase.createModule("tp_alice", {
        courseId: course.id,
        title: "Module 1: Domain-Driven Design",
      });
      assert.strictEqual(mod1.title, "Module 1: Domain-Driven Design");

      // 2. Update Module
      const modUpdated = await useCase.updateModule("tp_alice", mod1.id, {
        title: "Module 1: Clean Architecture & DDD",
      });
      assert.strictEqual(modUpdated.title, "Module 1: Clean Architecture & DDD");

      // 3. Create Lesson
      const lesson1 = await useCase.createLesson("tp_alice", {
        moduleId: mod1.id,
        title: "Lesson 1.1: Aggregates & Entities",
        durationSeconds: 1800,
      });
      assert.strictEqual(lesson1.title, "Lesson 1.1: Aggregates & Entities");

      // 4. Update Lesson
      const lessonUpdated = await useCase.updateLesson("tp_alice", lesson1.id, {
        title: "Lesson 1.1: Entities and Value Objects",
      });
      assert.strictEqual(lessonUpdated.title, "Lesson 1.1: Entities and Value Objects");

      // 5. Reorder
      await useCase.reorderModules("tp_alice", course.id, [{ id: mod1.id, sortOrder: 1 }]);
      await useCase.reorderLessons("tp_alice", mod1.id, [{ id: lesson1.id, sortOrder: 1 }]);

      // 6. Delete Lesson
      const lessonDeleted = await useCase.deleteLesson("tp_alice", lesson1.id);
      assert.strictEqual(lessonDeleted, true);

      // 7. Delete Module
      const modDeleted = await useCase.deleteModule("tp_alice", mod1.id);
      assert.strictEqual(modDeleted, true);
    });

    it("should prevent non-owners from modifying modules or lessons", async () => {
      const courseRepo = new MockCourseRepository();
      const curriculumRepo = new MockCurriculumRepository();
      const useCase = new TeacherCourseUseCase(courseRepo, curriculumRepo);

      const course = await useCase.createCourse({
        title: "Alice Course",
        teacherProfileId: "tp_alice",
        categoryId: "cat_1",
      });

      const mod = await useCase.createModule("tp_alice", {
        courseId: course.id,
        title: "Alice Module",
      });

      await assert.rejects(
        () => useCase.updateModule("tp_bob", mod.id, { title: "Bob Intrusion" }),
        (err: any) => err instanceof ForbiddenError
      );
    });
  });

  // --------------------------------------------------------------------------
  // 4. ADMIN MODERATION OPERATIONS
  // --------------------------------------------------------------------------
  describe("Admin Moderation (AdminManageCoursesUseCase)", () => {
    it("should toggle featured and trending flags as admin", async () => {
      const courseRepo = new MockCourseRepository();
      const notifService = new MockNotificationService();
      const useCase = new AdminManageCoursesUseCase(courseRepo, notifService);

      const course = await courseRepo.create({
        title: "Admin Moderated Course",
        teacherProfileId: "tp_alice",
        categoryId: "cat_1",
      });

      const featured = await useCase.toggleFeatured(course.id, true);
      assert.strictEqual(featured.isFeatured, true);

      const trending = await useCase.toggleTrending(course.id, true);
      assert.strictEqual(trending.isTrending, true);
    });

    it("should freeze a course and dispatch notification email to teacher", async () => {
      const courseRepo = new MockCourseRepository();
      const notifService = new MockNotificationService();
      const useCase = new AdminManageCoursesUseCase(courseRepo, notifService);

      const course = await courseRepo.create({
        title: "Infringing Content Course",
        teacherProfileId: "tp_alice",
        categoryId: "cat_1",
      });

      const frozen = await useCase.freezeCourse(course.id, { reason: "Copyright complaint received" });
      assert.strictEqual(frozen.isFrozen, true);
      assert.strictEqual(frozen.status, "FROZEN");
      assert.strictEqual(notifService.frozenEmails.length, 1);
      assert.strictEqual(notifService.frozenEmails[0].email, "alice@coursity.io");
      assert.strictEqual(notifService.frozenEmails[0].reason, "Copyright complaint received");
    });

    it("should unfreeze a course and restore PUBLISHED status", async () => {
      const courseRepo = new MockCourseRepository();
      const notifService = new MockNotificationService();
      const useCase = new AdminManageCoursesUseCase(courseRepo, notifService);

      const course = await courseRepo.create({
        title: "Temporarily Frozen Course",
        teacherProfileId: "tp_alice",
        categoryId: "cat_1",
      });

      await useCase.freezeCourse(course.id, { reason: "Investigation" });
      const unfrozen = await useCase.unfreezeCourse(course.id);
      assert.strictEqual(unfrozen.isFrozen, false);
      assert.strictEqual(unfrozen.status, "PUBLISHED");
    });

    it("should prevent delisting a course that has already started", async () => {
      const courseRepo = new MockCourseRepository();
      const notifService = new MockNotificationService();
      const useCase = new AdminManageCoursesUseCase(courseRepo, notifService);

      const pastDate = new Date(Date.now() - 86400000); // 1 day ago
      const course = await courseRepo.create({
        title: "Already Started Course",
        teacherProfileId: "tp_alice",
        categoryId: "cat_1",
        startingDate: pastDate,
      });

      await assert.rejects(
        () => useCase.delistCourse(course.id, { reason: "Low enrollment" }),
        (err: any) => err instanceof BadRequestError && err.message.includes("Cannot delist a course that has already started")
      );
    });

    it("should allow delisting a future course and notify the teacher", async () => {
      const courseRepo = new MockCourseRepository();
      const notifService = new MockNotificationService();
      const useCase = new AdminManageCoursesUseCase(courseRepo, notifService);

      const futureDate = new Date(Date.now() + 86400000 * 30); // 30 days ahead
      const course = await courseRepo.create({
        title: "Future Live Cohort",
        teacherProfileId: "tp_alice",
        categoryId: "cat_1",
        startingDate: futureDate,
      });

      const delisted = await useCase.delistCourse(course.id, { reason: "Curriculum overhaul required" });
      assert.strictEqual(delisted.isDeleted, true);
      assert.strictEqual(delisted.status, "ARCHIVED");
      assert.strictEqual(notifService.delistedEmails.length, 1);
      assert.strictEqual(notifService.delistedEmails[0].email, "alice@coursity.io");
    });

    it("should handle restore and hardDelete", async () => {
      const courseRepo = new MockCourseRepository();
      const notifService = new MockNotificationService();
      const useCase = new AdminManageCoursesUseCase(courseRepo, notifService);

      const course = await courseRepo.create({
        title: "Course to Delete",
        teacherProfileId: "tp_alice",
        categoryId: "cat_1",
      });

      await useCase.softDelete(course.id);
      const restored = await useCase.restore(course.id);
      assert.strictEqual(restored.isDeleted, false);

      const deleted = await useCase.hardDelete(course.id);
      assert.strictEqual(deleted, true);
      assert.strictEqual(await courseRepo.findById(course.id, true), null);
    });
  });

  // --------------------------------------------------------------------------
  // 5. PRESENTATION & SECURITY CONTROLLERS
  // --------------------------------------------------------------------------
  describe("Presentation Controllers & Role Authorization", () => {
    it("should permit both ADMIN and SUPERADMIN in admin controllers and reject others", async () => {
      const courseRepo = new MockCourseRepository();
      const notifService = new MockNotificationService();
      const useCase = new AdminManageCoursesUseCase(courseRepo, notifService);

      const getAllController = new AdminGetAllCoursesController(useCase);

      const createReq = (role?: string) =>
        ({
          user: role ? { userId: "u1", role } : undefined,
          query: {},
          params: {},
        } as any);

      const createRes = () => {
        const res: any = {};
        res.status = () => res;
        res.json = (data: any) => data;
        return res;
      };

      // 1. ADMIN allowed
      let errorAdmin: any = null;
      await getAllController.execute(createReq("ADMIN"), createRes(), (err) => {
        errorAdmin = err;
      });
      assert.strictEqual(errorAdmin, null, "ADMIN should be permitted");

      // 2. SUPERADMIN allowed
      let errorSuper: any = null;
      await getAllController.execute(createReq("SUPERADMIN"), createRes(), (err) => {
        errorSuper = err;
      });
      assert.strictEqual(errorSuper, null, "SUPERADMIN should be permitted");

      // 3. STUDENT rejected
      let errorStudent: any = null;
      await getAllController.execute(createReq("STUDENT"), createRes(), (err) => {
        errorStudent = err;
      });
      assert.ok(errorStudent instanceof ForbiddenError, "STUDENT must be rejected");

      // 4. TEACHER rejected
      let errorTeacher: any = null;
      await getAllController.execute(createReq("TEACHER"), createRes(), (err) => {
        errorTeacher = err;
      });
      assert.ok(errorTeacher instanceof ForbiddenError, "TEACHER must be rejected");
    });

    it("should reject unauthenticated requests in teacher controllers", async () => {
      const courseRepo = new MockCourseRepository();
      const curriculumRepo = new MockCurriculumRepository();
      const useCase = new TeacherCourseUseCase(courseRepo, curriculumRepo);
      const resolver = new MockTeacherProfileResolver();

      const controller = new CreateCourseController(useCase, resolver);

      let caughtError: any = null;
      await controller.execute({ user: undefined, body: {} } as any, {} as any, (err) => {
        caughtError = err;
      });
      assert.ok(caughtError instanceof UnauthorizedError);
    });

    it("teacherUpdateCourseSchema must strip or disallow isFeatured and isTrending", () => {
      const parsed = teacherUpdateCourseSchema.parse({
        title: "Clean Title",
        isFeatured: true,
        isTrending: true,
      });
      // The schema does not define isFeatured or isTrending, so Zod strips them by default
      assert.strictEqual((parsed as any).isFeatured, undefined);
      assert.strictEqual((parsed as any).isTrending, undefined);
    });
  });

  // --------------------------------------------------------------------------
  // 6. MODULE FACTORY & CLEAN ARCHITECTURE COMPOSITION
  // --------------------------------------------------------------------------
  describe("createCourseModule Factory", () => {
    it("should instantiate the full course module with custom injected dependencies", () => {
      const courseRepo = new MockCourseRepository();
      const curriculumRepo = new MockCurriculumRepository();
      const notifService = new MockNotificationService();
      const resolver = new MockTeacherProfileResolver();

      const courseMod = createCourseModule({
        courseRepository: courseRepo,
        curriculumRepository: curriculumRepo,
        notificationService: notifService,
        profileResolver: resolver,
      });

      assert.ok(courseMod.courseRepository);
      assert.ok(courseMod.curriculumRepository);
      assert.ok(courseMod.getCoursesUseCase);
      assert.ok(courseMod.teacherCourseUseCase);
      assert.ok(courseMod.adminManageCoursesUseCase);
      assert.ok(courseMod.courseController);
      assert.ok(courseMod.courseRouter);
    });
  });
});

