import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  CourseEnrollmentEntity,
  LessonProgressEntity,
  CourseRefundEntity,
  CourseCertificateEntity,
  CourseRefundPolicy,
  TeacherRoyaltyPolicy,
  CourseCertificatePolicy,
  IEnrollmentRepository,
  CreateEnrollmentData,
  UpsertLessonProgressData,
  CreateRefundData,
  CreateCertificateData,
  ListEnrollmentsFilter,
  ListEnrollmentsResult,
  EnrollmentDetailResult,
  EnrollFreeCourseUseCase,
  CreateCourseCheckoutOrderUseCase,
  VerifyCoursePaymentUseCase,
  PayWithWalletUseCase,
  GetStudentEnrollmentsUseCase,
  GetCourseClassroomUseCase,
  MarkClassAttendanceUseCase,
  UpdateLessonProgressUseCase,
  RequestCourseRefundUseCase,
  ClaimCertificateUseCase,
  GetCertificateUseCase,
  TeacherGetCourseStudentsUseCase,
  createEnrollmentModule,
  createCourseCheckoutOrderSchema,
  verifyCoursePaymentSchema,
  requestCourseRefundSchema,
  CreateCourseOrderController,
  RequestRefundController,
  TeacherGetCourseStudentsController,
} from "../src/modules/enrollment";
import { ICourseRepository } from "../src/modules/course";
import { ITeacherProfileResolver } from "../src/modules/course/domain/services/teacher-profile-resolver.service";
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError, UnauthorizedError } from "../src/app/errors";

// ============================================================================
// IN-MEMORY MOCKS
// ============================================================================

class MockEnrollmentRepository implements IEnrollmentRepository {
  public enrollments: Map<string, CourseEnrollmentEntity> = new Map();
  public progress: Map<string, LessonProgressEntity> = new Map(); // key: `${enrollmentId}_${lessonId}`
  public refunds: Map<string, CourseRefundEntity> = new Map(); // key: enrollmentId
  public certificates: Map<string, CourseCertificateEntity> = new Map(); // key: enrollmentId
  public conductedClasses: Map<string, number> = new Map(); // key: courseId -> count

  async createEnrollment(data: CreateEnrollmentData): Promise<CourseEnrollmentEntity> {
    const id = `enr_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const entity: CourseEnrollmentEntity = {
      id,
      studentId: data.studentId,
      courseId: data.courseId,
      status: "ACTIVE",
      originalPrice: data.originalPrice,
      discountAmount: data.discountAmount,
      finalAmount: data.finalAmount,
      currency: data.currency,
      paymentMethod: data.paymentMethod,
      razorpayOrderId: data.razorpayOrderId ?? null,
      razorpayPaymentId: data.razorpayPaymentId ?? null,
      invoiceNumber: data.invoiceNumber,
      teacherCouponId: data.teacherCouponId ?? null,
      appliedCouponCode: data.appliedCouponCode ?? null,
      refundEligibleUntil: data.refundEligibleUntil,
      enrolledAt: new Date(),
      firstAccessedAt: null,
      completedAt: null,
      progressPercentage: 0,
      attendedClassesCount: 0,
      completedLessonsCount: 0,
      lastAccessedLessonId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      courseTitle: "Live Masterclass",
      courseStartingDate: new Date(),
      totalLessons: 10,
      instructorName: "Instructor Alice",
      studentName: "Student Bob",
    };
    this.enrollments.set(id, entity);
    return { ...entity };
  }

  async findEnrollmentById(id: string): Promise<CourseEnrollmentEntity | null> {
    const enr = this.enrollments.get(id);
    return enr ? { ...enr } : null;
  }

  async findEnrollmentByStudentAndCourse(studentId: string, courseId: string): Promise<CourseEnrollmentEntity | null> {
    for (const enr of this.enrollments.values()) {
      if (enr.studentId === studentId && enr.courseId === courseId) {
        return { ...enr };
      }
    }
    return null;
  }

  async listStudentEnrollments(studentId: string): Promise<CourseEnrollmentEntity[]> {
    return Array.from(this.enrollments.values()).filter((e) => e.studentId === studentId);
  }

  async listCourseEnrollments(courseId: string): Promise<CourseEnrollmentEntity[]> {
    return Array.from(this.enrollments.values()).filter((e) => e.courseId === courseId);
  }

  async updateEnrollment(id: string, data: Partial<CourseEnrollmentEntity>): Promise<CourseEnrollmentEntity> {
    const existing = this.enrollments.get(id);
    if (!existing) throw new NotFoundError("Enrollment not found");
    const updated = { ...existing, ...data, updatedAt: new Date() };
    this.enrollments.set(id, updated);
    return { ...updated };
  }

  async upsertLessonProgress(data: UpsertLessonProgressData): Promise<LessonProgressEntity> {
    const key = `${data.enrollmentId}_${data.lessonId}`;
    const existing = this.progress.get(key);
    const updated: LessonProgressEntity = {
      id: existing ? existing.id : `lp_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      enrollmentId: data.enrollmentId,
      lessonId: data.lessonId,
      isCompleted: data.isCompleted ?? existing?.isCompleted ?? false,
      completedAt: data.isCompleted ? new Date() : existing?.completedAt ?? null,
      attendedLive: data.attendedLive ?? existing?.attendedLive ?? false,
      attendedAt: data.attendedLive ? new Date() : existing?.attendedAt ?? null,
      liveAttendanceMinutes: data.liveAttendanceMinutes ?? existing?.liveAttendanceMinutes ?? 0,
      lastPositionSeconds: data.lastPositionSeconds ?? existing?.lastPositionSeconds ?? 0,
      createdAt: existing?.createdAt ?? new Date(),
      updatedAt: new Date(),
    };
    this.progress.set(key, updated);
    return { ...updated };
  }

  async findLessonProgress(enrollmentId: string, lessonId: string): Promise<LessonProgressEntity | null> {
    return this.progress.get(`${enrollmentId}_${lessonId}`) ?? null;
  }

  async listLessonProgressForEnrollment(enrollmentId: string): Promise<LessonProgressEntity[]> {
    return Array.from(this.progress.values()).filter((p) => p.enrollmentId === enrollmentId);
  }

  async countConductedClasses(courseId: string): Promise<number> {
    return this.conductedClasses.get(courseId) ?? 0;
  }

  async countTotalCourseLessons(courseId: string): Promise<number> {
    return 10;
  }

  async countCompletedLessons(enrollmentId: string): Promise<number> {
    return Array.from(this.progress.values()).filter((p) => p.enrollmentId === enrollmentId && p.isCompleted).length;
  }

  async countAttendedLessons(enrollmentId: string): Promise<number> {
    return Array.from(this.progress.values()).filter((p) => p.enrollmentId === enrollmentId && p.attendedLive).length;
  }

  async findLessonById(lessonId: string): Promise<{ id: string } | null> {
    return { id: lessonId };
  }

  async createRefund(data: CreateRefundData): Promise<CourseRefundEntity> {
    const id = `rfnd_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const refund: CourseRefundEntity = {
      id,
      enrollmentId: data.enrollmentId,
      studentId: data.studentId,
      amount: data.amount,
      currency: data.currency,
      reason: data.reason,
      status: "PROCESSED",
      destination: data.destination,
      gatewayRefundId: data.gatewayRefundId ?? null,
      classesConductedAtRefund: data.classesConductedAtRefund,
      classesAttendedAtRefund: data.classesAttendedAtRefund,
      daysElapsedAtRefund: data.daysElapsedAtRefund,
      processedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.refunds.set(data.enrollmentId, refund);
    return { ...refund };
  }

  async findRefundByEnrollmentId(enrollmentId: string): Promise<CourseRefundEntity | null> {
    return this.refunds.get(enrollmentId) ?? null;
  }

  async createCertificate(data: CreateCertificateData): Promise<CourseCertificateEntity> {
    const id = `cert_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const cert: CourseCertificateEntity = {
      id,
      enrollmentId: data.enrollmentId,
      certificateCode: data.certificateCode,
      studentName: data.studentName,
      courseTitle: data.courseTitle,
      instructorName: data.instructorName,
      issuedAt: new Date(),
      pdfUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.certificates.set(data.enrollmentId, cert);
    return { ...cert };
  }

  async findCertificateByCode(certificateCode: string): Promise<CourseCertificateEntity | null> {
    for (const cert of this.certificates.values()) {
      if (cert.certificateCode === certificateCode) return { ...cert };
    }
    return null;
  }

  async findCertificateByEnrollmentId(enrollmentId: string): Promise<CourseCertificateEntity | null> {
    return this.certificates.get(enrollmentId) ?? null;
  }

  async listAllEnrollments(filters?: ListEnrollmentsFilter): Promise<ListEnrollmentsResult> {
    const items = Array.from(this.enrollments.values());
    return {
      items,
      total: items.length,
      metrics: {
        totalEnrollments: items.length,
        activeEnrollments: items.filter((e) => e.status === "ACTIVE").length,
        completedEnrollments: items.filter((e) => e.status === "COMPLETED").length,
        refundedEnrollments: items.filter((e) => e.status === "REFUNDED").length,
        totalRevenue: items.reduce((acc, e) => acc + e.finalAmount, 0),
        totalRefundedAmount: 0,
        totalDiscounts: items.reduce((acc, e) => acc + e.discountAmount, 0),
      },
    };
  }

  async findEnrollmentDetail(id: string, teacherUserId?: string): Promise<EnrollmentDetailResult | null> {
    const enr = this.enrollments.get(id);
    if (!enr) return null;
    return {
      enrollment: { ...enr },
      lessonProgress: Array.from(this.progress.values()).filter((p) => p.enrollmentId === id),
      refund: this.refunds.get(id) ?? null,
      certificate: this.certificates.get(id) ?? null,
    };
  }

  async findCourseClassroomData(courseIdOrSlug: string): Promise<any | null> {
    return {
      id: courseIdOrSlug,
      title: "Live Cloud Architecture",
      slug: "live-cloud-architecture",
      subtitle: "Learn cloud native architecture live",
      description: "Comprehensive live course",
      startingDate: new Date(),
      pricingType: "PAID",
      price: 4999,
      level: "ADVANCED",
      modules: [
        {
          id: "mod_1",
          title: "Module 1",
          sortOrder: 1,
          lessons: [
            {
              id: "les_1",
              title: "Lesson 1: Intro",
              durationSeconds: 3600,
              sortOrder: 1,
              liveStatus: "COMPLETED",
              isLiveNow: false,
            },
          ],
        },
      ],
      teacherProfile: {
        profile: {
          user: { id: "usr_teacher", name: "Prof. Sarah", email: "sarah@coursity.io" },
        },
      },
    };
  }

  // IBaseRepository
  async findById(id: string) {
    return this.findEnrollmentById(id);
  }
  async findMany() {
    return { items: Array.from(this.enrollments.values()), total: this.enrollments.size, totalPages: 1 };
  }
  async create(data: any) {
    return this.createEnrollment(data);
  }
  async update(id: string, data: any) {
    return this.updateEnrollment(id, data);
  }
  async delete(id: string) {
    return this.enrollments.delete(id);
  }
}

class MockCourseRepo {
  public courses: Map<string, any> = new Map();

  async findById(id: string) {
    return this.courses.get(id) ?? null;
  }
}

class MockUserRepo {
  public users: Map<string, any> = new Map();

  async findById(id: string) {
    return this.users.get(id) ?? null;
  }
}

class MockWalletRepo {
  public wallets: Map<string, { balance: number }> = new Map();
  public debits: any[] = [];
  public credits: any[] = [];

  async findByUserId(userId: string) {
    return this.wallets.get(userId) ?? { balance: 0 };
  }

  async debit(params: any) {
    const current = this.wallets.get(params.userId) ?? { balance: 0 };
    if (current.balance < params.amount) throw new BadRequestError("Insufficient wallet balance.");
    current.balance -= params.amount;
    this.wallets.set(params.userId, current);
    this.debits.push(params);
    return current;
  }

  async credit(params: any) {
    const current = this.wallets.get(params.userId) ?? { balance: 0 };
    current.balance += params.amount;
    this.wallets.set(params.userId, current);
    this.credits.push(params);
    return current;
  }
}

class MockPaymentGateway {
  public orders: any[] = [];
  public refunds: any[] = [];

  async createOrder(params: any) {
    const orderId = `order_${Date.now()}`;
    this.orders.push({ orderId, ...params });
    return { orderId, keyId: "rzp_test_key" };
  }

  verifyPaymentSignature(params: any) {
    return params.signature === "valid_sig";
  }

  async refundPayment(params: any) {
    const refundId = `rfnd_gw_${Date.now()}`;
    this.refunds.push({ refundId, ...params });
    return { refundId, status: "processed" };
  }
}

class MockEmailNotifier {
  public sentEmails: any[] = [];
  async sendCustomEmail(params: any) {
    this.sentEmails.push(params);
  }
}

class MockTeacherProfileResolver implements ITeacherProfileResolver {
  public mappings: Map<string, string> = new Map();
  async getTeacherProfileIdByUserId(userId: string) {
    return this.mappings.get(userId) ?? `tp_${userId}`;
  }
}

// ============================================================================
// TEST SUITES
// ============================================================================

describe("Enrollment Module Clean Architecture & SOLID Principles Suite", () => {
  // --------------------------------------------------------------------------
  // 1. DOMAIN POLICIES (SRP & OCP)
  // --------------------------------------------------------------------------
  describe("1. CourseRefundPolicy (20-Day / 4-Classes Guarantee)", () => {
    it("should allow refund within 20 days and under 4 classes conducted & attended", () => {
      const now = new Date();
      const mockEnrollment: any = {
        status: "ACTIVE",
        finalAmount: 1999,
        enrolledAt: now,
        courseStartingDate: now,
        refundEligibleUntil: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
      };

      const result = CourseRefundPolicy.checkEligibility({
        enrollment: mockEnrollment,
        classesConductedCount: 2,
        classesAttendedCount: 1,
        hasClaimedCertificate: false,
        now,
      });

      assert.strictEqual(result.isEligible, true);
      assert.strictEqual(result.paidAmount, 1999);
      assert.strictEqual(result.classesConducted, 2);
    });

    it("should reject refund if elapsed days exceed 20 calendar days", () => {
      const now = new Date();
      const enrolledAt = new Date(now.getTime() - 22 * 24 * 60 * 60 * 1000); // 22 days ago
      const mockEnrollment: any = {
        status: "ACTIVE",
        finalAmount: 1999,
        enrolledAt,
        courseStartingDate: enrolledAt,
        refundEligibleUntil: new Date(enrolledAt.getTime() + 20 * 24 * 60 * 60 * 1000),
      };

      const result = CourseRefundPolicy.checkEligibility({
        enrollment: mockEnrollment,
        classesConductedCount: 1,
        classesAttendedCount: 1,
        hasClaimedCertificate: false,
        now,
      });

      assert.strictEqual(result.isEligible, false);
      assert.ok(result.reasonIfNotEligible?.includes("20-day refund policy ended"));
    });

    it("should reject refund if 4 or more live classes have been conducted", () => {
      const now = new Date();
      const mockEnrollment: any = {
        status: "ACTIVE",
        finalAmount: 1999,
        enrolledAt: now,
        courseStartingDate: now,
        refundEligibleUntil: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
      };

      const result = CourseRefundPolicy.checkEligibility({
        enrollment: mockEnrollment,
        classesConductedCount: 4,
        classesAttendedCount: 0,
        hasClaimedCertificate: false,
        now,
      });

      assert.strictEqual(result.isEligible, false);
      assert.ok(result.reasonIfNotEligible?.includes("4 live class sessions have already been conducted"));
    });

    it("should reject refund if student has attended 4 or more live classes", () => {
      const now = new Date();
      const mockEnrollment: any = {
        status: "ACTIVE",
        finalAmount: 1999,
        enrolledAt: now,
        courseStartingDate: now,
        refundEligibleUntil: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
      };

      const result = CourseRefundPolicy.checkEligibility({
        enrollment: mockEnrollment,
        classesConductedCount: 3,
        classesAttendedCount: 4,
        hasClaimedCertificate: false,
        now,
      });

      assert.strictEqual(result.isEligible, false);
      assert.ok(result.reasonIfNotEligible?.includes("You have already attended 4 or more live classes"));
    });

    it("should reject refund if a course certificate was already claimed", () => {
      const now = new Date();
      const mockEnrollment: any = {
        status: "ACTIVE",
        finalAmount: 1999,
        enrolledAt: now,
        courseStartingDate: now,
        refundEligibleUntil: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
      };

      const result = CourseRefundPolicy.checkEligibility({
        enrollment: mockEnrollment,
        classesConductedCount: 1,
        classesAttendedCount: 1,
        hasClaimedCertificate: true,
        now,
      });

      assert.strictEqual(result.isEligible, false);
      assert.ok(result.reasonIfNotEligible?.includes("certificate has been claimed"));
    });

    it("TeacherRoyaltyPolicy should calculate 85% instructor earnings and 15% platform fee", () => {
      const royalty = TeacherRoyaltyPolicy.calculateRoyalty(1000);
      assert.strictEqual(royalty, 850);

      const platformFee = TeacherRoyaltyPolicy.calculatePlatformCommission(1000);
      assert.strictEqual(platformFee, 150);
    });

    it("CourseCertificatePolicy should only allow claiming certificate if progress >= 90%", () => {
      const eligibleEnrollment: any = { status: "ACTIVE", progressPercentage: 92, completedLessonsCount: 9, totalLessons: 10 };
      const ineligibleEnrollment: any = { status: "ACTIVE", progressPercentage: 65, completedLessonsCount: 6, totalLessons: 10 };

      assert.strictEqual(CourseCertificatePolicy.isEligibleForCertificate(eligibleEnrollment).isEligible, true);
      assert.strictEqual(CourseCertificatePolicy.isEligibleForCertificate(ineligibleEnrollment).isEligible, false);

      const code = CourseCertificatePolicy.generateCertificateCode(2026);
      assert.ok(code.startsWith("CRT-2026-"));
    });
  });

  // --------------------------------------------------------------------------
  // 2. CHECKOUT & ENROLLMENT USE CASES
  // --------------------------------------------------------------------------
  describe("2. Checkout & Enrollment Use Cases", () => {
    it("EnrollFreeCourseUseCase: should enroll student in free course and reject paid course", async () => {
      const enrRepo = new MockEnrollmentRepository();
      const courseRepo = new MockCourseRepo();
      const useCase = new EnrollFreeCourseUseCase(enrRepo, courseRepo as any);

      courseRepo.courses.set("c_free", { id: "c_free", pricingType: "FREE", price: 0, title: "Intro Course" });
      courseRepo.courses.set("c_paid", { id: "c_paid", pricingType: "PAID", price: 999, title: "Paid Course" });

      const enrollment = await useCase.execute("student_1", "c_free");
      assert.strictEqual(enrollment.status, "ACTIVE");
      assert.strictEqual(enrollment.paymentMethod, "FREE");
      assert.strictEqual(enrollment.finalAmount, 0);

      // Rejects paid course
      await assert.rejects(
        () => useCase.execute("student_1", "c_paid"),
        (err: any) => err instanceof BadRequestError && err.message.includes("paid course")
      );
    });

    it("CreateCourseCheckoutOrderUseCase: should create order with wallet balance", async () => {
      const enrRepo = new MockEnrollmentRepository();
      const courseRepo = new MockCourseRepo();
      const walletRepo = new MockWalletRepo();
      const paymentGateway = new MockPaymentGateway();
      const validateCouponUC: any = { execute: async () => ({ isValid: false }) };

      const useCase = new CreateCourseCheckoutOrderUseCase(
        validateCouponUC,
        paymentGateway,
        courseRepo as any,
        enrRepo,
        walletRepo as any
      );

      courseRepo.courses.set("c_paid", { id: "c_paid", pricingType: "PAID", price: 1000, title: "Paid Course", currency: "INR" });
      walletRepo.wallets.set("student_1", { balance: 400 });

      const result = await useCase.execute("student_1", {
        courseId: "c_paid",
        useWalletBalance: true,
      });

      assert.strictEqual(result.originalPrice, 1000);
      assert.strictEqual(result.walletDeductedAmount, 400);
      assert.strictEqual(result.finalPayableAmount, 600);
      assert.strictEqual(result.isFullyPaidByWallet, false);
      assert.ok(result.orderId.startsWith("order_"));
    });

    it("VerifyCoursePaymentUseCase: verifies signature, credits teacher royalty (85%), and creates enrollment", async () => {
      const enrRepo = new MockEnrollmentRepository();
      const courseRepo = new MockCourseRepo();
      const userRepo = new MockUserRepo();
      const walletRepo = new MockWalletRepo();
      const paymentGateway = new MockPaymentGateway();
      const emailNotifier = new MockEmailNotifier();
      const couponRepo: any = { findByCode: async () => null };

      const useCase = new VerifyCoursePaymentUseCase(
        enrRepo,
        couponRepo,
        courseRepo as any,
        userRepo as any,
        walletRepo as any,
        paymentGateway,
        emailNotifier
      );

      courseRepo.courses.set("c_1", {
        id: "c_1",
        price: 2000,
        title: "Docker Mastery",
        teacherProfile: { profile: { userId: "teacher_1" } },
      });
      userRepo.users.set("student_1", { id: "student_1", name: "Bob", email: "bob@example.com" });

      const enrollment = await useCase.execute("student_1", {
        courseId: "c_1",
        razorpayOrderId: "order_123",
        razorpayPaymentId: "pay_123",
        razorpaySignature: "valid_sig",
      });

      assert.strictEqual(enrollment.status, "ACTIVE");
      assert.strictEqual(enrollment.finalAmount, 2000);

      // Verify teacher royalty credited (85% of 2000 = 1700)
      const teacherWallet = await walletRepo.findByUserId("teacher_1");
      assert.strictEqual(teacherWallet.balance, 1700);

      // Verify email dispatched
      assert.strictEqual(emailNotifier.sentEmails.length, 1);
    });

    it("PayWithWalletUseCase: deducts student wallet, credits teacher royalty (85%), and creates enrollment", async () => {
      const enrRepo = new MockEnrollmentRepository();
      const courseRepo = new MockCourseRepo();
      const userRepo = new MockUserRepo();
      const walletRepo = new MockWalletRepo();
      const emailNotifier = new MockEmailNotifier();
      const couponRepo: any = { findByCode: async () => null };

      const useCase = new PayWithWalletUseCase(
        enrRepo,
        couponRepo,
        courseRepo as any,
        userRepo as any,
        walletRepo as any,
        emailNotifier
      );

      courseRepo.courses.set("c_wallet", {
        id: "c_wallet",
        price: 500,
        title: "Microservices",
        teacherProfile: { profile: { userId: "teacher_2" } },
      });
      userRepo.users.set("student_2", { id: "student_2", name: "Charlie", email: "charlie@example.com" });
      walletRepo.wallets.set("student_2", { balance: 1000 });

      const enrollment = await useCase.execute("student_2", {
        courseId: "c_wallet",
      });

      assert.strictEqual(enrollment.status, "ACTIVE");
      assert.strictEqual(enrollment.paymentMethod, "WALLET");

      // Student balance deducted (1000 - 500 = 500)
      assert.strictEqual((await walletRepo.findByUserId("student_2")).balance, 500);

      // Teacher credited 85% of 500 = 425
      assert.strictEqual((await walletRepo.findByUserId("teacher_2")).balance, 425);
    });
  });

  // --------------------------------------------------------------------------
  // 3. REFUND LIFECYCLE & POLICY ENFORCEMENT
  // --------------------------------------------------------------------------
  describe("3. 20-Day / 4-Classes Full Refund Guarantee", () => {
    it("RequestCourseRefundUseCase: executes full refund to wallet, reverses teacher royalty, and updates status", async () => {
      const enrRepo = new MockEnrollmentRepository();
      const courseRepo = new MockCourseRepo();
      const userRepo = new MockUserRepo();
      const walletRepo = new MockWalletRepo();
      const paymentGateway = new MockPaymentGateway();
      const emailNotifier = new MockEmailNotifier();

      const useCase = new RequestCourseRefundUseCase(
        enrRepo,
        courseRepo as any,
        userRepo as any,
        walletRepo as any,
        paymentGateway,
        emailNotifier
      );

      courseRepo.courses.set("c_ref", {
        id: "c_ref",
        title: "Refundable Course",
        teacherProfile: { profile: { userId: "teacher_3" } },
      });
      userRepo.users.set("student_3", { id: "student_3", name: "Dave", email: "dave@example.com" });
      walletRepo.wallets.set("teacher_3", { balance: 850 }); // Prior earnings

      const enrollment = await enrRepo.createEnrollment({
        studentId: "student_3",
        courseId: "c_ref",
        originalPrice: 1000,
        discountAmount: 0,
        finalAmount: 1000,
        currency: "INR",
        paymentMethod: "WALLET",
        invoiceNumber: "INV-123",
        refundEligibleUntil: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days remaining
      });

      const refund = await useCase.execute("student_3", {
        enrollmentId: enrollment.id,
        reason: "Schedule conflict",
        destination: "WALLET",
      });

      assert.strictEqual(refund.status, "PROCESSED");
      assert.strictEqual(refund.amount, 1000);

      // Student credited 1000 in wallet
      assert.strictEqual((await walletRepo.findByUserId("student_3")).balance, 1000);

      // Teacher royalty debited (850 - 850 = 0)
      assert.strictEqual((await walletRepo.findByUserId("teacher_3")).balance, 0);

      // Enrollment status updated to REFUNDED
      const updated = await enrRepo.findEnrollmentById(enrollment.id);
      assert.strictEqual(updated?.status, "REFUNDED");
    });

    it("RequestCourseRefundUseCase: rejects refund if 4 live classes conducted", async () => {
      const enrRepo = new MockEnrollmentRepository();
      const courseRepo = new MockCourseRepo();
      const userRepo = new MockUserRepo();
      const walletRepo = new MockWalletRepo();
      const paymentGateway = new MockPaymentGateway();
      const emailNotifier = new MockEmailNotifier();

      const useCase = new RequestCourseRefundUseCase(
        enrRepo,
        courseRepo as any,
        userRepo as any,
        walletRepo as any,
        paymentGateway,
        emailNotifier
      );

      courseRepo.courses.set("c_held4", { id: "c_held4", title: "Held Course" });
      enrRepo.conductedClasses.set("c_held4", 4); // 4 sessions conducted

      const enrollment = await enrRepo.createEnrollment({
        studentId: "student_4",
        courseId: "c_held4",
        originalPrice: 1000,
        discountAmount: 0,
        finalAmount: 1000,
        currency: "INR",
        paymentMethod: "WALLET",
        invoiceNumber: "INV-456",
        refundEligibleUntil: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      });

      await assert.rejects(
        () =>
          useCase.execute("student_4", {
            enrollmentId: enrollment.id,
            reason: "Too fast",
            destination: "WALLET",
          }),
        (err: any) => err instanceof BadRequestError && err.message.includes("4 live class sessions have already been conducted")
      );
    });
  });

  // --------------------------------------------------------------------------
  // 4. PROGRESS, ATTENDANCE & CERTIFICATES
  // --------------------------------------------------------------------------
  describe("4. Progress, Attendance & Certificate Claiming", () => {
    it("UpdateLessonProgressUseCase: recalculates progress and sets COMPLETED at 100%", async () => {
      const enrRepo = new MockEnrollmentRepository();
      const useCase = new UpdateLessonProgressUseCase(enrRepo);

      const enrollment = await enrRepo.createEnrollment({
        studentId: "student_5",
        courseId: "c_prog",
        originalPrice: 0,
        discountAmount: 0,
        finalAmount: 0,
        currency: "INR",
        paymentMethod: "FREE",
        invoiceNumber: "INV-789",
        refundEligibleUntil: new Date(),
      });

      // Complete 10 out of 10 lessons
      for (let i = 1; i <= 10; i++) {
        await useCase.execute("student_5", {
          enrollmentId: enrollment.id,
          lessonId: `les_${i}`,
          isCompleted: true,
        });
      }

      const updated = await enrRepo.findEnrollmentById(enrollment.id);
      assert.strictEqual(updated?.progressPercentage, 100);
      assert.strictEqual(updated?.status, "COMPLETED");
    });

    it("ClaimCertificateUseCase: claims certificate at >= 90% progress, rejects if < 90%", async () => {
      const enrRepo = new MockEnrollmentRepository();
      const userRepo = new MockUserRepo();
      const useCase = new ClaimCertificateUseCase(enrRepo, userRepo as any);

      userRepo.users.set("student_6", { id: "student_6", name: "Eve", email: "eve@example.com" });

      const enrollment = await enrRepo.createEnrollment({
        studentId: "student_6",
        courseId: "c_cert",
        originalPrice: 0,
        discountAmount: 0,
        finalAmount: 0,
        currency: "INR",
        paymentMethod: "FREE",
        invoiceNumber: "INV-CERT",
        refundEligibleUntil: new Date(),
      });

      // Ineligible at 50%
      await enrRepo.updateEnrollment(enrollment.id, { progressPercentage: 50, completedLessonsCount: 5, totalLessons: 10 });
      await assert.rejects(
        () => useCase.execute("student_6", enrollment.id),
        (err: any) => err instanceof BadRequestError && err.message.includes("You must complete at least 90%")
      );

      // Eligible at 90%
      await enrRepo.updateEnrollment(enrollment.id, { progressPercentage: 90, completedLessonsCount: 9, totalLessons: 10 });
      const cert = await useCase.execute("student_6", enrollment.id);
      assert.ok(cert.certificateCode.startsWith("CRT-"));
      assert.strictEqual(cert.studentName, "Eve");
    });
  });

  // --------------------------------------------------------------------------
  // 5. SECURITY & PRESENTATION CONTROLLERS
  // --------------------------------------------------------------------------
  describe("5. Presentation Validation & Security Guards", () => {
    it("TeacherGetCourseStudentsUseCase: prevents non-instructors from viewing student rosters (IDOR Guard)", async () => {
      const enrRepo = new MockEnrollmentRepository();
      const courseRepo = new MockCourseRepo();
      const useCase = new TeacherGetCourseStudentsUseCase(enrRepo, courseRepo as any);

      courseRepo.courses.set("c_teacher_1", {
        id: "c_teacher_1",
        teacherProfileId: "tp_alice",
      });

      // Authorized teacher succeeds
      const list = await useCase.execute("tp_alice", "c_teacher_1");
      assert.ok(Array.isArray(list));

      // Unauthorized teacher rejected with ForbiddenError
      await assert.rejects(
        () => useCase.execute("tp_bob", "c_teacher_1"),
        (err: any) => err instanceof ForbiddenError
      );
    });

    it("Zod schema validation prevents invalid payloads in controllers", () => {
      // Invalid UUID courseId throws
      assert.throws(() => createCourseCheckoutOrderSchema.parse({ courseId: "not-a-uuid" }));
      assert.throws(() => verifyCoursePaymentSchema.parse({ courseId: "not-a-uuid" }));
      // Short reason throws
      assert.throws(() => requestCourseRefundSchema.parse({ reason: "bad" }));

      // Valid payloads succeed
      const valid = requestCourseRefundSchema.parse({
        reason: "Legitimate reason for refund",
        destination: "WALLET",
      });
      assert.strictEqual(valid.destination, "WALLET");
    });
  });

  // --------------------------------------------------------------------------
  // 6. MODULE FACTORY & DEPENDENCY INJECTION
  // --------------------------------------------------------------------------
  describe("6. createEnrollmentModule Factory", () => {
    it("should instantiate enrollment module with custom injected dependencies", () => {
      const enrRepo = new MockEnrollmentRepository();
      const courseRepo = new MockCourseRepo();
      const userRepo = new MockUserRepo();
      const walletRepo = new MockWalletRepo();
      const paymentGateway = new MockPaymentGateway();
      const emailNotifier = new MockEmailNotifier();

      const mod = createEnrollmentModule({
        enrollmentRepo: enrRepo,
        courseRepo: courseRepo as any,
        userRepo: userRepo as any,
        walletRepo: walletRepo as any,
        paymentGateway: paymentGateway as any,
        emailService: emailNotifier as any,
      });

      assert.ok(mod.enrollmentRepo);
      assert.ok(mod.enrollmentController);
      assert.ok(mod.enrollmentRouter);
      assert.ok(mod.createOrderUseCase);
      assert.ok(mod.verifyPaymentUseCase);
      assert.ok(mod.requestRefundUseCase);
    });
  });
});
