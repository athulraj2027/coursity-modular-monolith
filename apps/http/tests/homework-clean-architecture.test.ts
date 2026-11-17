import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  HomeworkEntity,
  HomeworkSubmissionEntity,
  CreateHomeworkDTO,
  UpdateHomeworkDTO,
  SubmitHomeworkDTO,
  ReviewSubmissionDTO,
  HomeworkFilterParams,
  PaginatedResult,
  LectureCourseContext,
  IHomeworkRepository,
  HomeworkValidationPolicy,
  HomeworkSubmissionPolicy,
  HomeworkGradingPolicy,
  CreateHomeworkUseCase,
  UpdateHomeworkUseCase,
  DeleteHomeworkUseCase,
  SubmitHomeworkUseCase,
  ReviewSubmissionUseCase,
  GetHomeworkByCourseUseCase,
  GetHomeworkByLectureUseCase,
  GetHomeworkDetailUseCase,
  GetMySubmissionUseCase,
  GetHomeworkSubmissionsUseCase,
  AdminListHomeworkUseCase,
  createHomeworkModule,
  createHomeworkBodySchema,
  updateHomeworkBodySchema,
  submitHomeworkBodySchema,
  reviewSubmissionBodySchema,
  CreateHomeworkController,
  SubmitHomeworkController,
  ReviewSubmissionController,
} from "../src/modules/homework";
import {
  HomeworkValidationError,
  HomeworkAccessDeniedError,
  HomeworkNotFoundError,
  SubmissionNotFoundError,
} from "../src/modules/homework/domain/errors/homework.errors";
import { ZodError } from "zod";

// ============================================================================
// IN-MEMORY MOCK REPOSITORY IMPLEMENTATION
// ============================================================================

class MockHomeworkRepository implements IHomeworkRepository {
  public homeworks: Map<string, HomeworkEntity> = new Map();
  public submissions: Map<string, HomeworkSubmissionEntity> = new Map(); // key: `${homeworkId}_${studentId}`
  public lectures: Map<string, LectureCourseContext> = new Map();
  public enrollments: Set<string> = new Set(); // key: `${studentId}_${courseId}`
  public teacherProfiles: Map<string, string> = new Map(); // key: userId -> teacherProfileId
  public courseTeachers: Map<string, string> = new Map(); // key: courseId -> teacherProfileId

  async findById(id: string, includeDeleted = false): Promise<HomeworkEntity | null> {
    const hw = this.homeworks.get(id);
    if (!hw) return null;
    if (!includeDeleted && hw.isDeleted) return null;
    return { ...hw };
  }

  async findByLectureId(
    lectureId: string,
    studentId?: string,
    includeDeleted = false
  ): Promise<HomeworkEntity[]> {
    const results: HomeworkEntity[] = [];
    for (const hw of this.homeworks.values()) {
      if (hw.lectureId === lectureId) {
        if (!includeDeleted && (hw.isDeleted || !hw.isPublished)) continue;
        let mySubmission: HomeworkSubmissionEntity | null = null;
        if (studentId) {
          mySubmission = this.submissions.get(`${hw.id}_${studentId}`) || null;
        }
        results.push({ ...hw, mySubmission });
      }
    }
    return results;
  }

  async findByCourseId(
    courseId: string,
    studentId?: string,
    includeDeleted = false
  ): Promise<HomeworkEntity[]> {
    const results: HomeworkEntity[] = [];
    for (const hw of this.homeworks.values()) {
      if (hw.courseId === courseId) {
        if (!includeDeleted && (hw.isDeleted || !hw.isPublished)) continue;
        let mySubmission: HomeworkSubmissionEntity | null = null;
        if (studentId) {
          mySubmission = this.submissions.get(`${hw.id}_${studentId}`) || null;
        }
        results.push({ ...hw, mySubmission });
      }
    }
    return results;
  }

  async findLectureWithCourse(lectureId: string): Promise<LectureCourseContext | null> {
    const ctx = this.lectures.get(lectureId);
    return ctx ? { ...ctx } : null;
  }

  async create(
    courseId: string,
    teacherProfileId: string,
    data: CreateHomeworkDTO
  ): Promise<HomeworkEntity> {
    const id = `hw_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const now = new Date();
    const entity: HomeworkEntity = {
      id,
      title: data.title,
      description: data.description || null,
      taskContent: data.taskContent || null,
      taskUrl: data.taskUrl || null,
      attachmentUrl: data.attachmentUrl || null,
      attachmentKey: data.attachmentKey || null,
      attachmentName: data.attachmentName || null,
      attachmentType: data.attachmentType || null,
      attachmentSize: data.attachmentSize || 0,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      maxScore: data.maxScore ?? 100,
      lectureId: data.lectureId,
      courseId,
      teacherProfileId,
      sortOrder: data.sortOrder || 0,
      isPublished: true,
      isDeleted: false,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    this.homeworks.set(id, entity);
    return { ...entity };
  }

  async update(id: string, data: UpdateHomeworkDTO): Promise<HomeworkEntity> {
    const existing = this.homeworks.get(id);
    if (!existing) throw new Error("Not found");
    const updated: HomeworkEntity = {
      ...existing,
      title: data.title !== undefined ? data.title : existing.title,
      description: data.description !== undefined ? data.description : existing.description,
      taskContent: data.taskContent !== undefined ? data.taskContent : existing.taskContent,
      taskUrl: data.taskUrl !== undefined ? data.taskUrl : existing.taskUrl,
      attachmentUrl: data.attachmentUrl !== undefined ? data.attachmentUrl : existing.attachmentUrl,
      dueDate: data.dueDate !== undefined ? (data.dueDate ? new Date(data.dueDate) : null) : existing.dueDate,
      maxScore: data.maxScore !== undefined ? data.maxScore : existing.maxScore,
      sortOrder: data.sortOrder !== undefined ? data.sortOrder : existing.sortOrder,
      isPublished: data.isPublished !== undefined ? data.isPublished : existing.isPublished,
      updatedAt: new Date(),
    };
    this.homeworks.set(id, updated);
    return { ...updated };
  }

  async softDelete(id: string): Promise<boolean> {
    const existing = this.homeworks.get(id);
    if (!existing) return false;
    existing.isDeleted = true;
    existing.deletedAt = new Date();
    return true;
  }

  async findSubmission(homeworkId: string, studentId: string): Promise<HomeworkSubmissionEntity | null> {
    const sub = this.submissions.get(`${homeworkId}_${studentId}`);
    return sub ? { ...sub } : null;
  }

  async findSubmissionById(submissionId: string): Promise<HomeworkSubmissionEntity | null> {
    for (const sub of this.submissions.values()) {
      if (sub.id === submissionId) return { ...sub };
    }
    return null;
  }

  async findSubmissionsByHomeworkId(homeworkId: string): Promise<HomeworkSubmissionEntity[]> {
    const list: HomeworkSubmissionEntity[] = [];
    for (const sub of this.submissions.values()) {
      if (sub.homeworkId === homeworkId) list.push({ ...sub });
    }
    return list;
  }

  async createOrUpdateSubmission(
    homeworkId: string,
    studentId: string,
    data: SubmitHomeworkDTO,
    isLate: boolean
  ): Promise<HomeworkSubmissionEntity> {
    const key = `${homeworkId}_${studentId}`;
    const existing = this.submissions.get(key);
    const now = new Date();

    if (existing) {
      const updated: HomeworkSubmissionEntity = {
        ...existing,
        submissionText: data.submissionText !== undefined ? data.submissionText : existing.submissionText,
        submissionUrl: data.submissionUrl !== undefined ? data.submissionUrl : existing.submissionUrl,
        fileUrl: data.fileUrl !== undefined ? data.fileUrl : existing.fileUrl,
        status: "RESUBMITTED",
        verificationStatus: "PENDING",
        attemptCount: existing.attemptCount + 1,
        submittedAt: now,
        isLate,
        updatedAt: now,
      };
      this.submissions.set(key, updated);
      return { ...updated };
    } else {
      const created: HomeworkSubmissionEntity = {
        id: `sub_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        homeworkId,
        studentId,
        submissionText: data.submissionText || null,
        submissionUrl: data.submissionUrl || null,
        fileUrl: data.fileUrl || null,
        fileKey: data.fileKey || null,
        fileName: data.fileName || null,
        fileType: data.fileType || null,
        fileSizeBytes: data.fileSizeBytes || 0,
        status: "SUBMITTED",
        verificationStatus: "PENDING",
        feedback: null,
        score: null,
        reviewedAt: null,
        reviewedByTeacherId: null,
        submittedAt: now,
        isLate,
        attemptCount: 1,
        createdAt: now,
        updatedAt: now,
        studentName: "Test Student",
        studentEmail: "student@test.com",
      };
      this.submissions.set(key, created);
      return { ...created };
    }
  }

  async reviewSubmission(
    submissionId: string,
    reviewedByTeacherId: string,
    data: ReviewSubmissionDTO
  ): Promise<HomeworkSubmissionEntity> {
    for (const [key, sub] of this.submissions.entries()) {
      if (sub.id === submissionId) {
        const updated: HomeworkSubmissionEntity = {
          ...sub,
          verificationStatus: data.verificationStatus,
          feedback: data.feedback !== undefined ? data.feedback : sub.feedback,
          score: data.score !== undefined ? data.score : sub.score,
          reviewedAt: new Date(),
          reviewedByTeacherId,
          updatedAt: new Date(),
        };
        this.submissions.set(key, updated);
        return { ...updated };
      }
    }
    throw new Error("Submission not found");
  }

  async findManyAdmin(params: HomeworkFilterParams): Promise<PaginatedResult<HomeworkEntity>> {
    const list = Array.from(this.homeworks.values()).filter((h) => !h.isDeleted);
    return {
      items: list,
      total: list.length,
      page: params.page || 1,
      limit: params.limit || 10,
      totalPages: 1,
    };
  }

  async isStudentEnrolled(studentId: string, courseId: string): Promise<boolean> {
    return this.enrollments.has(`${studentId}_${courseId}`);
  }

  async getTeacherProfileIdByUserId(userId: string): Promise<string | null> {
    return this.teacherProfiles.get(userId) || null;
  }

  async getCourseTeacherProfileId(courseId: string): Promise<string | null> {
    return this.courseTeachers.get(courseId) || null;
  }
}

// ============================================================================
// TEST SUITES
// ============================================================================

describe("Homework Module Clean Architecture & SOLID Principles Suite", () => {
  // --------------------------------------------------------------------------
  // SUITE 1: Domain Policies
  // --------------------------------------------------------------------------
  describe("1. Domain Policies (SRP & Pure Business Invariants)", () => {
    it("HomeworkValidationPolicy: should validate homework creation payload", () => {
      assert.throws(
        () =>
          HomeworkValidationPolicy.validateCreation({
            title: "",
            lectureId: "lec-1",
            description: "Some task",
          }),
        HomeworkValidationError
      );

      assert.throws(
        () =>
          HomeworkValidationPolicy.validateCreation({
            title: "Task 1",
            lectureId: "",
            description: "Some task",
          }),
        HomeworkValidationError
      );

      // Rejects if no content provided
      assert.throws(
        () =>
          HomeworkValidationPolicy.validateCreation({
            title: "Task 1",
            lectureId: "lec-1",
          }),
        HomeworkValidationError
      );

      // Rejects negative maxScore
      assert.throws(
        () =>
          HomeworkValidationPolicy.validateCreation({
            title: "Task 1",
            lectureId: "lec-1",
            description: "Task description",
            maxScore: -10,
          }),
        HomeworkValidationError
      );

      // Valid creation succeeds
      assert.doesNotThrow(() =>
        HomeworkValidationPolicy.validateCreation({
          title: "Build REST API",
          lectureId: "lec-1",
          taskContent: "Implement Express endpoints",
          maxScore: 100,
        })
      );
    });

    it("HomeworkSubmissionPolicy: should validate submission content and calculate deadline/lateness", () => {
      // Rejects empty submission
      assert.throws(
        () => HomeworkSubmissionPolicy.validateSubmissionPayload({}),
        HomeworkValidationError
      );

      // Accepts text submission
      assert.doesNotThrow(() =>
        HomeworkSubmissionPolicy.validateSubmissionPayload({
          submissionText: "Here is my answer",
        })
      );

      // Accepts link submission
      assert.doesNotThrow(() =>
        HomeworkSubmissionPolicy.validateSubmissionPayload({
          submissionUrl: "https://github.com/student/homework-repo",
        })
      );

      // Lateness check
      const pastDue = new Date(Date.now() - 10000);
      const futureDue = new Date(Date.now() + 100000);
      assert.equal(HomeworkSubmissionPolicy.isLate(pastDue), true);
      assert.equal(HomeworkSubmissionPolicy.isLate(futureDue), false);
      assert.equal(HomeworkSubmissionPolicy.isLate(null), false);
    });

    it("HomeworkSubmissionPolicy: should prevent student resubmission if assignment is already VERIFIED", () => {
      const verifiedSub: HomeworkSubmissionEntity = {
        id: "sub-1",
        homeworkId: "hw-1",
        studentId: "stu-1",
        submissionText: "Done",
        submissionUrl: null,
        fileUrl: null,
        fileKey: null,
        fileName: null,
        fileType: null,
        fileSizeBytes: 0,
        status: "SUBMITTED",
        verificationStatus: "VERIFIED",
        feedback: "Great job! 100/100",
        score: 100,
        reviewedAt: new Date(),
        reviewedByTeacherId: "tch-1",
        submittedAt: new Date(),
        isLate: false,
        attemptCount: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const check1 = HomeworkSubmissionPolicy.canResubmit(verifiedSub);
      assert.equal(check1.allowed, false);
      assert.match(check1.reason || "", /already been verified/);

      // But if teacher marked as REDO, resubmission is permitted
      const redoSub = { ...verifiedSub, verificationStatus: "REDO" as const };
      const check2 = HomeworkSubmissionPolicy.canResubmit(redoSub);
      assert.equal(check2.allowed, true);
    });

    it("HomeworkGradingPolicy: should validate review status and enforce maxScore bounds", () => {
      assert.throws(
        () =>
          HomeworkGradingPolicy.validateReview(
            { verificationStatus: "INVALID_STATUS" as any },
            100
          ),
        HomeworkValidationError
      );

      assert.throws(
        () =>
          HomeworkGradingPolicy.validateReview(
            { verificationStatus: "VERIFIED", score: 150 },
            100
          ),
        HomeworkValidationError
      );

      assert.throws(
        () =>
          HomeworkGradingPolicy.validateReview(
            { verificationStatus: "VERIFIED", score: -5 },
            100
          ),
        HomeworkValidationError
      );

      const sanitized = HomeworkGradingPolicy.sanitizeReviewData(
        { verificationStatus: "VERIFIED", score: 95.8, feedback: " Excellent " },
        100
      );
      assert.equal(sanitized.verificationStatus, "VERIFIED");
      assert.equal(sanitized.score, 95);
      assert.equal(sanitized.feedback, "Excellent");
    });
  });

  // --------------------------------------------------------------------------
  // SUITE 2: Assignment Authoring & Lifecycle
  // --------------------------------------------------------------------------
  describe("2. Assignment Authoring & Lifecycle (Create, Update, Delete)", () => {
    it("CreateHomeworkUseCase: enforces instructor ownership and creates assignment", async () => {
      const repo = new MockHomeworkRepository();
      repo.lectures.set("lec-1", {
        id: "lec-1",
        title: "Clean Architecture",
        courseId: "crs-1",
        courseTitle: "TypeScript Mastery",
        teacherProfileId: "prof-teacher-1",
      });
      repo.teacherProfiles.set("user-teacher-1", "prof-teacher-1");
      repo.teacherProfiles.set("user-teacher-other", "prof-teacher-other");

      const createUC = new CreateHomeworkUseCase(repo);

      // 1. Foreign teacher cannot assign homework to this lecture
      await assert.rejects(
        () =>
          createUC.execute({
            userId: "user-teacher-other",
            userRole: "TEACHER",
            data: {
              title: "Exercise 1",
              lectureId: "lec-1",
              taskContent: "Write tests",
            },
          }),
        HomeworkAccessDeniedError
      );

      // 2. Author teacher can assign homework
      const created = await createUC.execute({
        userId: "user-teacher-1",
        userRole: "TEACHER",
        data: {
          title: "Exercise 1",
          lectureId: "lec-1",
          taskContent: "Write tests",
          maxScore: 100,
        },
      });

      assert.equal(created.title, "Exercise 1");
      assert.equal(created.teacherProfileId, "prof-teacher-1");
      assert.equal(created.courseId, "crs-1");
    });

    it("UpdateHomeworkUseCase & DeleteHomeworkUseCase: enforces teacher ownership", async () => {
      const repo = new MockHomeworkRepository();
      repo.teacherProfiles.set("user-teacher-1", "prof-teacher-1");
      repo.teacherProfiles.set("user-teacher-other", "prof-teacher-other");

      const hw = await repo.create("crs-1", "prof-teacher-1", {
        title: "Original Title",
        lectureId: "lec-1",
        taskContent: "Initial prompt",
        maxScore: 100,
      });

      const updateUC = new UpdateHomeworkUseCase(repo);
      const deleteUC = new DeleteHomeworkUseCase(repo);

      // Other teacher cannot update or delete
      await assert.rejects(
        () =>
          updateUC.execute({
            homeworkId: hw.id,
            userId: "user-teacher-other",
            userRole: "TEACHER",
            data: { title: "Hacked Title" },
          }),
        HomeworkAccessDeniedError
      );

      await assert.rejects(
        () =>
          deleteUC.execute({
            homeworkId: hw.id,
            userId: "user-teacher-other",
            userRole: "TEACHER",
          }),
        HomeworkAccessDeniedError
      );

      // Owner teacher can update
      const updated = await updateUC.execute({
        homeworkId: hw.id,
        userId: "user-teacher-1",
        userRole: "TEACHER",
        data: { title: "Updated Title" },
      });
      assert.equal(updated.title, "Updated Title");

      // Owner teacher can delete
      const deleted = await deleteUC.execute({
        homeworkId: hw.id,
        userId: "user-teacher-1",
        userRole: "TEACHER",
      });
      assert.equal(deleted, true);
    });
  });

  // --------------------------------------------------------------------------
  // SUITE 3: Student Submissions & State Transitions
  // --------------------------------------------------------------------------
  describe("3. Student Submissions & State Transitions", () => {
    it("SubmitHomeworkUseCase: enforces enrollment, tracks lateness, and transitions state", async () => {
      const repo = new MockHomeworkRepository();
      repo.enrollments.add("student-1_crs-1"); // student-1 is enrolled in crs-1

      const futureDue = new Date(Date.now() + 1000000);
      const hw = await repo.create("crs-1", "prof-teacher-1", {
        title: "Build Frontend",
        lectureId: "lec-1",
        taskContent: "Implement React component",
        dueDate: futureDue,
      });

      const submitUC = new SubmitHomeworkUseCase(repo);

      // Unenrolled student cannot submit
      await assert.rejects(
        () =>
          submitUC.execute({
            homeworkId: hw.id,
            studentId: "student-unenrolled",
            userRole: "STUDENT",
            data: { submissionText: "My solution" },
          }),
        HomeworkAccessDeniedError
      );

      // Enrolled student submits on time
      const sub1 = await submitUC.execute({
        homeworkId: hw.id,
        studentId: "student-1",
        userRole: "STUDENT",
        data: { submissionUrl: "https://github.com/student/react-hw" },
      });

      assert.equal(sub1.status, "SUBMITTED");
      assert.equal(sub1.verificationStatus, "PENDING");
      assert.equal(sub1.attemptCount, 1);
      assert.equal(sub1.isLate, false);

      // Resubmission before review increments attempt and sets RESUBMITTED
      const sub2 = await submitUC.execute({
        homeworkId: hw.id,
        studentId: "student-1",
        userRole: "STUDENT",
        data: { submissionUrl: "https://github.com/student/react-hw-v2" },
      });

      assert.equal(sub2.status, "RESUBMITTED");
      assert.equal(sub2.attemptCount, 2);
    });

    it("SubmitHomeworkUseCase: blocks resubmission when assignment is already VERIFIED", async () => {
      const repo = new MockHomeworkRepository();
      repo.enrollments.add("student-1_crs-1");

      const hw = await repo.create("crs-1", "prof-teacher-1", {
        title: "Docker Project",
        lectureId: "lec-1",
        taskContent: "Docker compose file",
      });

      const submitUC = new SubmitHomeworkUseCase(repo);

      const sub = await submitUC.execute({
        homeworkId: hw.id,
        studentId: "student-1",
        userRole: "STUDENT",
        data: { submissionText: "Compose file completed" },
      });

      // Teacher verifies submission with score
      await repo.reviewSubmission(sub.id, "prof-teacher-1", {
        verificationStatus: "VERIFIED",
        score: 100,
        feedback: "Perfect!",
      });

      // Student tries to resubmit on verified assignment -> REJECTED
      await assert.rejects(
        () =>
          submitUC.execute({
            homeworkId: hw.id,
            studentId: "student-1",
            userRole: "STUDENT",
            data: { submissionText: "Trying to overwrite" },
          }),
        HomeworkValidationError
      );
    });
  });

  // --------------------------------------------------------------------------
  // SUITE 4: Review & Grading
  // --------------------------------------------------------------------------
  describe("4. Review & Grading (ReviewSubmissionUseCase)", () => {
    it("ReviewSubmissionUseCase: enforces teacher ownership and caps scores at maxScore", async () => {
      const repo = new MockHomeworkRepository();
      repo.teacherProfiles.set("user-teacher-1", "prof-teacher-1");
      repo.teacherProfiles.set("user-teacher-rival", "prof-teacher-rival");

      const hw = await repo.create("crs-1", "prof-teacher-1", {
        title: "Algorithms Task",
        lectureId: "lec-1",
        taskContent: "Quicksort implementation",
        maxScore: 50,
      });

      const sub = await repo.createOrUpdateSubmission(
        hw.id,
        "student-1",
        { submissionText: "Solution code" },
        false
      );

      const reviewUC = new ReviewSubmissionUseCase(repo);

      // Rival teacher cannot review
      await assert.rejects(
        () =>
          reviewUC.execute({
            submissionId: sub.id,
            userId: "user-teacher-rival",
            userRole: "TEACHER",
            data: { verificationStatus: "VERIFIED", score: 45 },
          }),
        HomeworkAccessDeniedError
      );

      // Owner teacher cannot award score exceeding maxScore
      await assert.rejects(
        () =>
          reviewUC.execute({
            submissionId: sub.id,
            userId: "user-teacher-1",
            userRole: "TEACHER",
            data: { verificationStatus: "VERIFIED", score: 60 },
          }),
        HomeworkValidationError
      );

      // Owner teacher successfully verifies within maxScore
      const reviewed = await reviewUC.execute({
        submissionId: sub.id,
        userId: "user-teacher-1",
        userRole: "TEACHER",
        data: {
          verificationStatus: "VERIFIED",
          score: 48,
          feedback: "Great optimization!",
        },
      });

      assert.equal(reviewed.verificationStatus, "VERIFIED");
      assert.equal(reviewed.score, 48);
      assert.equal(reviewed.feedback, "Great optimization!");
    });
  });

  // --------------------------------------------------------------------------
  // SUITE 5: Course Queries & Critical IDOR Security Guard
  // --------------------------------------------------------------------------
  describe("5. Critical IDOR Security Guard in GetHomeworkByCourseUseCase", () => {
    it("GetHomeworkByCourseUseCase: prevents rival teachers from accessing other courses' homework", async () => {
      const repo = new MockHomeworkRepository();
      repo.courseTeachers.set("crs-1", "prof-teacher-1");
      repo.teacherProfiles.set("user-teacher-1", "prof-teacher-1");
      repo.teacherProfiles.set("user-teacher-rival", "prof-teacher-rival");
      repo.enrollments.add("student-enrolled_crs-1");

      await repo.create("crs-1", "prof-teacher-1", {
        title: "Proprietary Homework",
        lectureId: "lec-1",
        taskContent: "Confidential assignment",
      });

      const getCourseHomeworkUC = new GetHomeworkByCourseUseCase(repo);

      // 1. Course Instructor can access
      const instructorResults = await getCourseHomeworkUC.execute({
        courseId: "crs-1",
        userId: "user-teacher-1",
        userRole: "TEACHER",
      });
      assert.equal(instructorResults.length, 1);

      // 2. Rival teacher who is NOT the instructor and NOT enrolled is BLOCKED (IDOR Guard)
      await assert.rejects(
        () =>
          getCourseHomeworkUC.execute({
            courseId: "crs-1",
            userId: "user-teacher-rival",
            userRole: "TEACHER",
          }),
        HomeworkAccessDeniedError
      );

      // 3. Enrolled student can access
      const studentResults = await getCourseHomeworkUC.execute({
        courseId: "crs-1",
        userId: "student-enrolled",
        userRole: "STUDENT",
      });
      assert.equal(studentResults.length, 1);

      // 4. Unenrolled student is BLOCKED
      await assert.rejects(
        () =>
          getCourseHomeworkUC.execute({
            courseId: "crs-1",
            userId: "student-unenrolled",
            userRole: "STUDENT",
          }),
        HomeworkAccessDeniedError
      );
    });
  });

  // --------------------------------------------------------------------------
  // SUITE 6: Presentation Zod Schema Validation
  // --------------------------------------------------------------------------
  describe("6. Presentation Layer & Zod Validation", () => {
    it("createHomeworkBodySchema: validates payload fields and rejects malformed inputs", () => {
      // Rejects empty title
      assert.throws(
        () =>
          createHomeworkBodySchema.parse({
            title: "",
            lectureId: "123e4567-e89b-12d3-a456-426614174000",
          }),
        ZodError
      );

      // Rejects invalid UUID for lectureId
      assert.throws(
        () =>
          createHomeworkBodySchema.parse({
            title: "Valid Title",
            lectureId: "not-a-uuid",
          }),
        ZodError
      );

      // Rejects invalid taskUrl
      assert.throws(
        () =>
          createHomeworkBodySchema.parse({
            title: "Valid Title",
            lectureId: "123e4567-e89b-12d3-a456-426614174000",
            taskUrl: "not-a-url",
          }),
        ZodError
      );

      // Validates valid creation payload
      const valid = createHomeworkBodySchema.parse({
        title: "Clean Code",
        lectureId: "123e4567-e89b-12d3-a456-426614174000",
        taskContent: "Implement repository pattern",
        maxScore: 100,
      });
      assert.equal(valid.title, "Clean Code");
    });

    it("submitHomeworkBodySchema & reviewSubmissionBodySchema: validate client input", () => {
      // Invalid verification status
      assert.throws(
        () =>
          reviewSubmissionBodySchema.parse({
            verificationStatus: "APPROVED", // only VERIFIED or REDO allowed
          }),
        ZodError
      );

      // Valid review
      const validReview = reviewSubmissionBodySchema.parse({
        verificationStatus: "VERIFIED",
        score: 95,
        feedback: "Well done!",
      });
      assert.equal(validReview.verificationStatus, "VERIFIED");

      // Valid submission
      const validSubmit = submitHomeworkBodySchema.parse({
        submissionText: "My answer",
        submissionUrl: "https://example.com/project",
      });
      assert.equal(validSubmit.submissionText, "My answer");
    });
  });

  // --------------------------------------------------------------------------
  // SUITE 7: Dependency Inversion Module Factory
  // --------------------------------------------------------------------------
  describe("7. Dependency Inversion Module Factory (createHomeworkModule)", () => {
    it("createHomeworkModule: allows injecting custom mock repository", async () => {
      const mockRepo = new MockHomeworkRepository();
      const module = createHomeworkModule({ homeworkRepo: mockRepo });

      assert.ok(module.homeworkRouter);
      assert.ok(module.homeworkRepo);
      assert.ok(module.homeworkController);
      assert.ok(module.useCases.createHomeworkUseCase);
      assert.equal(module.homeworkRepo, mockRepo);
    });
  });
});
