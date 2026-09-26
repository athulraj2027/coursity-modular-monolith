import { PrismaClient } from "@prisma/client";
import { EnrollmentRepository } from "../../domain/repositories/enrollment.repository";
import {
  CourseEnrollmentEntity,
  EnrollmentStatus,
} from "../../domain/entities/enrollment.entity";
import { LessonProgressEntity } from "../../domain/entities/lesson-progress.entity";
import { CourseRefundEntity, CourseCertificateEntity } from "../../domain/entities/refund.entity";

export class PrismaEnrollmentRepository implements EnrollmentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private mapEnrollment(record: any): CourseEnrollmentEntity {
    const instructorUser = record.course?.teacherProfile?.profile?.user;
    return {
      id: record.id,
      studentId: record.studentId,
      courseId: record.courseId,
      status: record.status,
      originalPrice: Number(record.originalPrice),
      discountAmount: Number(record.discountAmount),
      finalAmount: Number(record.finalAmount),
      currency: record.currency,
      paymentMethod: record.paymentMethod,
      razorpayOrderId: record.razorpayOrderId,
      razorpayPaymentId: record.razorpayPaymentId,
      invoiceNumber: record.invoiceNumber,
      teacherCouponId: record.teacherCouponId,
      appliedCouponCode: record.appliedCouponCode,
      refundEligibleUntil: record.refundEligibleUntil,
      enrolledAt: record.enrolledAt,
      firstAccessedAt: record.firstAccessedAt,
      completedAt: record.completedAt,
      progressPercentage: record.progressPercentage,
      attendedClassesCount: record.attendedClassesCount,
      completedLessonsCount: record.completedLessonsCount,
      lastAccessedLessonId: record.lastAccessedLessonId,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      courseTitle: record.course?.title,
      courseSlug: record.course?.slug,
      courseThumbnail: record.course?.thumbnail,
      courseLevel: record.course?.level,
      courseStartingDate: record.course?.startingDate,
      totalLessons: record.course?.totalLessons,
      instructorName: instructorUser?.name || "Instructor",
      instructorEmail: instructorUser?.email,
      instructorAvatar: record.course?.teacherProfile?.profile?.avatar,
      studentName: record.student?.name,
      studentEmail: record.student?.email,
      studentAvatar: record.student?.avatar || null,
      refund: record.refund ? this.mapRefund(record.refund) : null,
      certificate: record.certificate ? this.mapCertificate(record.certificate) : null,
    };
  }


  private mapProgress(record: any): LessonProgressEntity {
    return {
      id: record.id,
      enrollmentId: record.enrollmentId,
      lessonId: record.lessonId,
      isCompleted: record.isCompleted,
      completedAt: record.completedAt,
      attendedLive: record.attendedLive,
      attendedAt: record.attendedAt,
      liveAttendanceMinutes: record.liveAttendanceMinutes,
      lastPositionSeconds: record.lastPositionSeconds,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      lessonTitle: record.lesson?.title,
      lessonType: "LIVE_CLASS",
      scheduledAt: record.lesson?.scheduledAt,
      liveStatus: record.lesson?.liveStatus,
    };
  }

  private mapRefund(record: any): CourseRefundEntity {
    return {
      id: record.id,
      enrollmentId: record.enrollmentId,
      studentId: record.studentId,
      amount: Number(record.amount),
      currency: record.currency,
      reason: record.reason,
      status: record.status,
      destination: record.destination,
      gatewayRefundId: record.gatewayRefundId,
      classesConductedAtRefund: record.classesConductedAtRefund,
      classesAttendedAtRefund: record.classesAttendedAtRefund,
      daysElapsedAtRefund: record.daysElapsedAtRefund,
      processedAt: record.processedAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      courseTitle: record.enrollment?.course?.title,
      studentName: record.student?.name,
      studentEmail: record.student?.email,
    };
  }

  private mapCertificate(record: any): CourseCertificateEntity {
    return {
      id: record.id,
      enrollmentId: record.enrollmentId,
      certificateCode: record.certificateCode,
      studentName: record.studentName,
      courseTitle: record.courseTitle,
      instructorName: record.instructorName,
      issuedAt: record.issuedAt,
      pdfUrl: record.pdfUrl,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  async createEnrollment(data: {
    studentId: string;
    courseId: string;
    originalPrice: number;
    discountAmount: number;
    finalAmount: number;
    currency: string;
    paymentMethod: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    invoiceNumber: string;
    teacherCouponId?: string;
    appliedCouponCode?: string;
    refundEligibleUntil: Date;
  }): Promise<CourseEnrollmentEntity> {
    const record = await this.prisma.courseEnrollment.create({
      data: {
        studentId: data.studentId,
        courseId: data.courseId,
        status: "ACTIVE",
        originalPrice: data.originalPrice,
        discountAmount: data.discountAmount,
        finalAmount: data.finalAmount,
        currency: data.currency,
        paymentMethod: data.paymentMethod,
        razorpayOrderId: data.razorpayOrderId,
        razorpayPaymentId: data.razorpayPaymentId,
        invoiceNumber: data.invoiceNumber,
        teacherCouponId: data.teacherCouponId || null,
        appliedCouponCode: data.appliedCouponCode || null,
        refundEligibleUntil: data.refundEligibleUntil,
      },
      include: {
        course: {
          include: {
            teacherProfile: {
              include: {
                profile: {
                  include: { user: true },
                },
              },
            },
          },
        },
        student: true,
      },
    });

    return this.mapEnrollment(record);
  }

  async findEnrollmentById(id: string): Promise<CourseEnrollmentEntity | null> {
    const record = await this.prisma.courseEnrollment.findUnique({
      where: { id },
      include: {
        course: {
          include: {
            teacherProfile: {
              include: {
                profile: {
                  include: { user: true },
                },
              },
            },
          },
        },
        student: true,
      },
    });
    return record ? this.mapEnrollment(record) : null;
  }

  async findEnrollmentByStudentAndCourse(studentId: string, courseId: string): Promise<CourseEnrollmentEntity | null> {
    const record = await this.prisma.courseEnrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
      include: {
        course: {
          include: {
            teacherProfile: {
              include: {
                profile: {
                  include: { user: true },
                },
              },
            },
          },
        },
        student: true,
      },
    });
    return record ? this.mapEnrollment(record) : null;
  }

  async listStudentEnrollments(studentId: string, status?: EnrollmentStatus): Promise<CourseEnrollmentEntity[]> {
    const where: any = { studentId };
    if (status) where.status = status;

    const records = await this.prisma.courseEnrollment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        course: {
          include: {
            teacherProfile: {
              include: {
                profile: {
                  include: { user: true },
                },
              },
            },
          },
        },
        student: true,
      },
    });
    return records.map((r) => this.mapEnrollment(r));
  }

  async listCourseEnrollments(courseId: string): Promise<CourseEnrollmentEntity[]> {
    const records = await this.prisma.courseEnrollment.findMany({
      where: { courseId },
      orderBy: { createdAt: "desc" },
      include: {
        course: {
          include: {
            teacherProfile: {
              include: {
                profile: {
                  include: { user: true },
                },
              },
            },
          },
        },
        student: true,
      },
    });
    return records.map((r) => this.mapEnrollment(r));
  }

  async updateEnrollment(id: string, data: Partial<CourseEnrollmentEntity>): Promise<CourseEnrollmentEntity> {
    const record = await this.prisma.courseEnrollment.update({
      where: { id },
      data: {
        ...(data.status !== undefined && { status: data.status }),
        ...(data.progressPercentage !== undefined && { progressPercentage: data.progressPercentage }),
        ...(data.attendedClassesCount !== undefined && { attendedClassesCount: data.attendedClassesCount }),
        ...(data.completedLessonsCount !== undefined && { completedLessonsCount: data.completedLessonsCount }),
        ...(data.lastAccessedLessonId !== undefined && { lastAccessedLessonId: data.lastAccessedLessonId }),
        ...(data.firstAccessedAt !== undefined && { firstAccessedAt: data.firstAccessedAt }),
        ...(data.completedAt !== undefined && { completedAt: data.completedAt }),
      },
      include: {
        course: {
          include: {
            teacherProfile: {
              include: {
                profile: {
                  include: { user: true },
                },
              },
            },
          },
        },
        student: true,
      },
    });
    return this.mapEnrollment(record);
  }

  async upsertLessonProgress(data: {
    enrollmentId: string;
    lessonId: string;
    isCompleted?: boolean;
    attendedLive?: boolean;
    liveAttendanceMinutes?: number;
    lastPositionSeconds?: number;
  }): Promise<LessonProgressEntity> {
    const existing = await this.prisma.lessonProgress.findUnique({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: data.enrollmentId,
          lessonId: data.lessonId,
        },
      },
    });

    if (existing) {
      const record = await this.prisma.lessonProgress.update({
        where: { id: existing.id },
        data: {
          ...(data.isCompleted !== undefined && {
            isCompleted: data.isCompleted,
            completedAt: data.isCompleted ? new Date() : null,
          }),
          ...(data.attendedLive !== undefined && {
            attendedLive: data.attendedLive,
            attendedAt: data.attendedLive ? new Date() : existing.attendedAt,
          }),
          ...(data.liveAttendanceMinutes !== undefined && {
            liveAttendanceMinutes: data.liveAttendanceMinutes,
          }),
          ...(data.lastPositionSeconds !== undefined && {
            lastPositionSeconds: data.lastPositionSeconds,
          }),
        },
        include: { lesson: true },
      });
      return this.mapProgress(record);
    } else {
      const record = await this.prisma.lessonProgress.create({
        data: {
          enrollmentId: data.enrollmentId,
          lessonId: data.lessonId,
          isCompleted: data.isCompleted || false,
          completedAt: data.isCompleted ? new Date() : null,
          attendedLive: data.attendedLive || false,
          attendedAt: data.attendedLive ? new Date() : null,
          liveAttendanceMinutes: data.liveAttendanceMinutes || 0,
          lastPositionSeconds: data.lastPositionSeconds || 0,
        },
        include: { lesson: true },
      });
      return this.mapProgress(record);
    }
  }

  async findLessonProgress(enrollmentId: string, lessonId: string): Promise<LessonProgressEntity | null> {
    const record = await this.prisma.lessonProgress.findUnique({
      where: {
        enrollmentId_lessonId: {
          enrollmentId,
          lessonId,
        },
      },
      include: { lesson: true },
    });
    return record ? this.mapProgress(record) : null;
  }

  async listLessonProgressForEnrollment(enrollmentId: string): Promise<LessonProgressEntity[]> {
    const records = await this.prisma.lessonProgress.findMany({
      where: { enrollmentId },
      include: { lesson: true },
    });
    return records.map((r) => this.mapProgress(r));
  }

  async createRefund(data: {
    enrollmentId: string;
    studentId: string;
    amount: number;
    currency: string;
    reason: string;
    destination: "WALLET" | "ORIGINAL_PAYMENT_METHOD";
    gatewayRefundId?: string;
    classesConductedAtRefund: number;
    classesAttendedAtRefund: number;
    daysElapsedAtRefund: number;
  }): Promise<CourseRefundEntity> {
    const record = await this.prisma.courseRefund.create({
      data: {
        enrollmentId: data.enrollmentId,
        studentId: data.studentId,
        amount: data.amount,
        currency: data.currency,
        reason: data.reason,
        destination: data.destination,
        gatewayRefundId: data.gatewayRefundId || null,
        classesConductedAtRefund: data.classesConductedAtRefund,
        classesAttendedAtRefund: data.classesAttendedAtRefund,
        daysElapsedAtRefund: data.daysElapsedAtRefund,
      },
      include: {
        enrollment: { include: { course: true } },
        student: true,
      },
    });
    return this.mapRefund(record);
  }

  async findRefundByEnrollmentId(enrollmentId: string): Promise<CourseRefundEntity | null> {
    const record = await this.prisma.courseRefund.findUnique({
      where: { enrollmentId },
      include: {
        enrollment: { include: { course: true } },
        student: true,
      },
    });
    return record ? this.mapRefund(record) : null;
  }

  async createCertificate(data: {
    enrollmentId: string;
    certificateCode: string;
    studentName: string;
    courseTitle: string;
    instructorName: string;
  }): Promise<CourseCertificateEntity> {
    const record = await this.prisma.courseCertificate.create({
      data: {
        enrollmentId: data.enrollmentId,
        certificateCode: data.certificateCode,
        studentName: data.studentName,
        courseTitle: data.courseTitle,
        instructorName: data.instructorName,
      },
    });
    return this.mapCertificate(record);
  }

  async findCertificateByCode(certificateCode: string): Promise<CourseCertificateEntity | null> {
    const record = await this.prisma.courseCertificate.findUnique({
      where: { certificateCode },
    });
    return record ? this.mapCertificate(record) : null;
  }

  async findCertificateByEnrollmentId(enrollmentId: string): Promise<CourseCertificateEntity | null> {
    const record = await this.prisma.courseCertificate.findUnique({
      where: { enrollmentId },
    });
    return record ? this.mapCertificate(record) : null;
  }

  async listAllEnrollments(filters?: {
    search?: string;
    status?: EnrollmentStatus;
    courseId?: string;
    teacherUserId?: string;
    paymentMethod?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<{
    items: CourseEnrollmentEntity[];
    total: number;
    metrics: {
      totalEnrollments: number;
      activeEnrollments: number;
      completedEnrollments: number;
      refundedEnrollments: number;
      totalRevenue: number;
      totalRefundedAmount: number;
      totalDiscounts: number;
    };
  }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.courseId) {
      where.courseId = filters.courseId;
    }
    if (filters?.paymentMethod) {
      where.paymentMethod = filters.paymentMethod;
    }
    if (filters?.teacherUserId) {
      where.course = {
        teacherProfile: {
          profile: {
            userId: filters.teacherUserId,
          },
        },
      };
    }

    if (filters?.search && filters.search.trim() !== "") {
      const q = filters.search.trim();
      where.OR = [
        { invoiceNumber: { contains: q, mode: "insensitive" } },
        { appliedCouponCode: { contains: q, mode: "insensitive" } },
        { razorpayPaymentId: { contains: q, mode: "insensitive" } },
        { razorpayOrderId: { contains: q, mode: "insensitive" } },
        {
          student: {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          },
        },
        {
          course: {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              {
                teacherProfile: {
                  profile: {
                    user: {
                      name: { contains: q, mode: "insensitive" },
                    },
                  },
                },
              },
            ],
          },
        },
      ];
    }

    const sortField = filters?.sortBy || "createdAt";
    const sortOrder = filters?.sortOrder || "desc";
    const orderBy: any = { [sortField]: sortOrder };

    const metricsWhere: any = {};
    if (filters?.teacherUserId) {
      metricsWhere.course = {
        teacherProfile: {
          profile: {
            userId: filters.teacherUserId,
          },
        },
      };
    }

    const [records, total, allEnrollmentsMetrics, refundsAggregate] = await Promise.all([
      this.prisma.courseEnrollment.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          course: {
            include: {
              teacherProfile: {
                include: {
                  profile: {
                    include: { user: true },
                  },
                },
              },
            },
          },
          student: true,
          refund: true,
          certificate: true,
        },
      }),
      this.prisma.courseEnrollment.count({ where }),
      this.prisma.courseEnrollment.findMany({
        where: metricsWhere,
        select: {
          id: true,
          status: true,
          finalAmount: true,
          discountAmount: true,
        },
      }),
      this.prisma.courseRefund.aggregate({
        where: filters?.teacherUserId
          ? {
              enrollment: {
                course: {
                  teacherProfile: {
                    profile: {
                      userId: filters.teacherUserId,
                    },
                  },
                },
              },
            }
          : undefined,
        _sum: {
          amount: true,
        },
      }),
    ]);

    const totalEnrollments = allEnrollmentsMetrics.length;
    const activeEnrollments = allEnrollmentsMetrics.filter((e) => e.status === "ACTIVE").length;
    const completedEnrollments = allEnrollmentsMetrics.filter((e) => e.status === "COMPLETED").length;
    const refundedEnrollments = allEnrollmentsMetrics.filter((e) => e.status === "REFUNDED").length;

    // Gross Revenue from non-refunded enrollments
    const totalRevenue = allEnrollmentsMetrics
      .filter((e) => e.status !== "REFUNDED")
      .reduce((sum, e) => sum + Number(e.finalAmount), 0);

    const totalRefundedAmount = Number(refundsAggregate._sum.amount || 0);

    const totalDiscounts = allEnrollmentsMetrics.reduce(
      (sum, e) => sum + Number(e.discountAmount),
      0
    );

    return {
      items: records.map((r) => this.mapEnrollment(r)),
      total,
      metrics: {
        totalEnrollments,
        activeEnrollments,
        completedEnrollments,
        refundedEnrollments,
        totalRevenue,
        totalRefundedAmount,
        totalDiscounts,
      },
    };
  }

  async findEnrollmentDetail(
    id: string,
    teacherUserId?: string
  ): Promise<{
    enrollment: CourseEnrollmentEntity;
    lessonProgress: LessonProgressEntity[];
    refund: CourseRefundEntity | null;
    certificate: CourseCertificateEntity | null;
  } | null> {
    const record = await this.prisma.courseEnrollment.findUnique({
      where: { id },
      include: {
        course: {
          include: {
            teacherProfile: {
              include: {
                profile: {
                  include: { user: true },
                },
              },
            },
            modules: {
              include: {
                lessons: {
                  orderBy: { sortOrder: "asc" },
                },
              },
              orderBy: { sortOrder: "asc" },
            },
          },
        },
        student: true,
        refund: true,
        certificate: true,
        lessonProgress: {
          include: { lesson: true },
        },
      },
    });

    if (!record) return null;

    if (teacherUserId) {
      const instructorUserId =
        record.course?.teacherProfile?.profile?.userId ||
        record.course?.teacherProfile?.profile?.user?.id;
      if (instructorUserId !== teacherUserId) {
        return null;
      }
    }

    const enrollment = this.mapEnrollment(record);
    const lessonProgress = (record.lessonProgress || []).map((lp: any) => this.mapProgress(lp));
    const refund = record.refund ? this.mapRefund(record.refund) : null;
    const certificate = record.certificate ? this.mapCertificate(record.certificate) : null;

    return {
      enrollment,
      lessonProgress,
      refund,
      certificate,
    };
  }
}

