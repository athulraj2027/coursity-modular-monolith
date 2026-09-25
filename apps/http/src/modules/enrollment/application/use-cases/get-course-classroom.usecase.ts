import { EnrollmentRepository } from "../../domain/repositories/enrollment.repository";
import { CourseClassroomResponse } from "../../domain/dtos/enrollment.dto";
import defaultPrisma from "@/infrastructure/database/prisma.client";
import { ForbiddenError, NotFoundError } from "@/app/errors";

export class GetCourseClassroomUseCase {
  constructor(private readonly enrollmentRepo: EnrollmentRepository) {}

  async execute(studentId: string, courseIdOrSlug: string): Promise<CourseClassroomResponse> {
    // 1. Resolve course by ID or Slug
    const course = await defaultPrisma.course.findFirst({
      where: {
        OR: [{ id: courseIdOrSlug }, { slug: courseIdOrSlug }],
      },
      include: {
        teacherProfile: {
          include: {
            profile: {
              include: { user: true },
            },
          },
        },
        modules: {
          where: { isPublished: true },
          orderBy: { sortOrder: "asc" },
          include: {
            lessons: {
              where: { isPublished: true },
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundError("Course not found.");
    }

    // 2. Fetch Active Enrollment
    const enrollment = await this.enrollmentRepo.findEnrollmentByStudentAndCourse(studentId, course.id);
    if (!enrollment || enrollment.status === "REFUNDED" || enrollment.status === "CANCELLED") {
      throw new ForbiddenError("You must have an active enrollment to access this live classroom.");
    }

    // 3. Fetch Lesson Progress
    const progressList = await this.enrollmentRepo.listLessonProgressForEnrollment(enrollment.id);
    const progressMap = new Map(progressList.map((p) => [p.lessonId, p]));

    // 4. Calculate 20-Day & 4-Class Policy Metrics
    const now = new Date();
    const refundDeadline = new Date(enrollment.refundEligibleUntil).getTime();
    const daysRemaining = Math.max(0, Math.ceil((refundDeadline - now.getTime()) / (1000 * 60 * 60 * 24)));

    let totalLessons = 0;
    let completedLessonsCount = 0;
    let attendedClassesCount = 0;
    let classesConductedCount = 0;

    const modules = course.modules.map((mod) => {
      const lessons = mod.lessons.map((les) => {
        totalLessons++;
        const prog = progressMap.get(les.id);
        const isCompleted = prog?.isCompleted || false;
        const attendedLive = prog?.attendedLive || false;
        const lastPositionSeconds = prog?.lastPositionSeconds || 0;

        if (isCompleted) completedLessonsCount++;
        if (attendedLive) attendedClassesCount++;

        if (les.liveStatus === "COMPLETED" || (les.scheduledAt && new Date(les.scheduledAt) <= now)) {
          classesConductedCount++;
        }

        return {
          id: les.id,
          title: les.title,
          description: les.description,
          lessonType: les.lessonType,
          durationSeconds: les.durationSeconds,
          sortOrder: les.sortOrder,
          scheduledAt: les.scheduledAt,
          liveMeetingUrl: les.liveMeetingUrl,
          isLiveNow: les.isLiveNow,
          recordingUrl: les.recordingUrl,
          liveStatus: les.liveStatus,
          videoUrl: les.videoUrl,
          articleBody: les.articleBody,
          attachments: les.attachments,
          isCompleted,
          attendedLive,
          lastPositionSeconds,
        };
      });

      return {
        id: mod.id,
        title: mod.title,
        description: mod.description,
        sortOrder: mod.sortOrder,
        lessons,
      };
    });

    const isWithinTimeWindow = now.getTime() <= refundDeadline;
    const isWithinClassCount = classesConductedCount < 4 && attendedClassesCount < 4;
    const isPaid = enrollment.finalAmount > 0;
    const isRefundEligible = enrollment.status === "ACTIVE" && isPaid && isWithinTimeWindow && isWithinClassCount;

    // Check certificate
    const certificate = await this.enrollmentRepo.findCertificateByEnrollmentId(enrollment.id);

    // Update progress snapshot on enrollment if changed
    const progressPercentage = totalLessons > 0 ? Number(((completedLessonsCount / totalLessons) * 100).toFixed(1)) : 0;
    await this.enrollmentRepo.updateEnrollment(enrollment.id, {
      progressPercentage,
      completedLessonsCount,
      attendedClassesCount,
      ...(enrollment.firstAccessedAt ? {} : { firstAccessedAt: now }),
    });

    const instructorUser = course.teacherProfile?.profile?.user;

    return {
      enrollment: {
        id: enrollment.id,
        status: enrollment.status,
        progressPercentage,
        attendedClassesCount,
        completedLessonsCount,
        totalLessons,
        enrolledAt: enrollment.enrolledAt,
        refundEligibleUntil: enrollment.refundEligibleUntil,
        isRefundEligible,
        daysRemainingForRefund: daysRemaining,
        classesConductedCount,
        isCertificateClaimed: Boolean(certificate),
        certificateCode: certificate?.certificateCode,
      },
      course: {
        id: course.id,
        title: course.title,
        slug: course.slug,
        subtitle: course.subtitle,
        description: course.description,
        startingDate: course.startingDate,
        level: course.level,
        instructor: {
          name: instructorUser?.name || "Instructor",
          avatar: course.teacherProfile?.profile?.avatar || null,
          bio: course.teacherProfile?.profile?.bio || null,
        },
      },
      modules,
    };
  }
}
