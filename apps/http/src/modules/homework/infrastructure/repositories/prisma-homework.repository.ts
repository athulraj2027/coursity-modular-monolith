import { PrismaClient, Prisma } from "@prisma/client";
import { IHomeworkRepository } from "../../domain/repositories/homework.repository";
import { HomeworkEntity, HomeworkSubmissionEntity } from "../../domain/entities/homework.entity";
import {
  CreateHomeworkDTO,
  UpdateHomeworkDTO,
  SubmitHomeworkDTO,
  ReviewSubmissionDTO,
  HomeworkFilterParams,
  PaginatedResult,
} from "../../domain/dtos/homework.dto";

export class PrismaHomeworkRepository implements IHomeworkRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private mapSubmissionToEntity(record: any): HomeworkSubmissionEntity {
    const studentUser = record.student;
    const studentProfile = studentUser?.profile;

    return {
      id: record.id,
      homeworkId: record.homeworkId,
      studentId: record.studentId,
      submissionText: record.submissionText,
      submissionUrl: record.submissionUrl,
      fileUrl: record.fileUrl,
      fileKey: record.fileKey,
      fileName: record.fileName,
      fileType: record.fileType,
      fileSizeBytes: record.fileSizeBytes ?? 0,
      status: record.status,
      verificationStatus: record.verificationStatus,
      feedback: record.feedback,
      score: record.score,
      reviewedAt: record.reviewedAt,
      reviewedByTeacherId: record.reviewedByTeacherId,
      submittedAt: record.submittedAt,
      isLate: record.isLate ?? false,
      attemptCount: record.attemptCount ?? 1,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,

      // Relation info
      studentName: studentProfile?.user?.name || studentUser?.name || "Student",
      studentEmail: studentUser?.email,
      studentAvatar: studentProfile?.avatar || null,
    };
  }

  private mapHomeworkToEntity(
    record: any,
    mySubmissionRecord?: any
  ): HomeworkEntity {
    const course = record.course;
    const lecture = record.lecture;
    const teacherUser =
      record.teacherProfile?.profile?.user || course?.teacherProfile?.profile?.user;

    const submissions = record.submissions || [];
    const verifiedCount = submissions.filter(
      (s: any) => s.verificationStatus === "VERIFIED"
    ).length;
    const redoCount = submissions.filter(
      (s: any) => s.verificationStatus === "REDO"
    ).length;
    const pendingCount = submissions.filter(
      (s: any) => s.verificationStatus === "PENDING"
    ).length;

    let mySubmission: HomeworkSubmissionEntity | null = null;
    if (mySubmissionRecord) {
      mySubmission = this.mapSubmissionToEntity(mySubmissionRecord);
    } else if (submissions.length === 1 && submissions[0].studentId) {
      // If we filtered submissions by current student
      mySubmission = this.mapSubmissionToEntity(submissions[0]);
    }

    return {
      id: record.id,
      title: record.title,
      description: record.description,
      taskContent: record.taskContent,
      taskUrl: record.taskUrl,
      attachmentUrl: record.attachmentUrl,
      attachmentKey: record.attachmentKey,
      attachmentName: record.attachmentName,
      attachmentType: record.attachmentType,
      attachmentSize: record.attachmentSize ?? 0,
      dueDate: record.dueDate,
      maxScore: record.maxScore ?? 100,
      lectureId: record.lectureId,
      courseId: record.courseId,
      teacherProfileId: record.teacherProfileId,
      sortOrder: record.sortOrder ?? 0,
      isPublished: record.isPublished ?? true,
      isDeleted: record.isDeleted ?? false,
      deletedAt: record.deletedAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,

      // Relations
      lectureTitle: lecture?.title,
      courseTitle: course?.title,
      courseSlug: course?.slug,
      teacherName: teacherUser?.name || "Instructor",
      teacherAvatar:
        record.teacherProfile?.profile?.avatar ||
        course?.teacherProfile?.profile?.avatar ||
        null,

      // Submissions summary
      mySubmission,
      totalSubmissions: submissions.length,
      verifiedCount,
      redoCount,
      pendingCount,
    };
  }

  async findById(id: string, includeDeleted = false): Promise<HomeworkEntity | null> {
    const record = await (this.prisma as any).lectureHomework.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { isDeleted: false }),
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
        lecture: true,
        teacherProfile: {
          include: {
            profile: {
              include: { user: true },
            },
          },
        },
        submissions: {
          include: {
            student: {
              include: { profile: true },
            },
          },
        },
      },
    });

    if (!record) return null;
    return this.mapHomeworkToEntity(record);
  }

  async findByLectureId(
    lectureId: string,
    studentId?: string,
    includeDeleted = false
  ): Promise<HomeworkEntity[]> {
    const records = await (this.prisma as any).lectureHomework.findMany({
      where: {
        lectureId,
        ...(includeDeleted ? {} : { isDeleted: false, isPublished: true }),
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: {
        course: true,
        lecture: true,
        teacherProfile: {
          include: {
            profile: {
              include: { user: true },
            },
          },
        },
        submissions: studentId
          ? {
              where: { studentId },
              include: {
                student: {
                  include: { profile: true },
                },
              },
            }
          : {
              include: {
                student: {
                  include: { profile: true },
                },
              },
            },
      },
    });

    return records.map((r: any) => this.mapHomeworkToEntity(r));
  }

  async findByCourseId(
    courseId: string,
    studentId?: string,
    includeDeleted = false
  ): Promise<HomeworkEntity[]> {
    const records = await (this.prisma as any).lectureHomework.findMany({
      where: {
        courseId,
        ...(includeDeleted ? {} : { isDeleted: false, isPublished: true }),
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: {
        course: true,
        lecture: true,
        teacherProfile: {
          include: {
            profile: {
              include: { user: true },
            },
          },
        },
        submissions: studentId
          ? {
              where: { studentId },
              include: {
                student: {
                  include: { profile: true },
                },
              },
            }
          : {
              include: {
                student: {
                  include: { profile: true },
                },
              },
            },
      },
    });

    return records.map((r: any) => this.mapHomeworkToEntity(r));
  }

  async findManyAdmin(params: HomeworkFilterParams): Promise<PaginatedResult<HomeworkEntity>> {
    const {
      page = 1,
      limit = 10,
      search,
      courseId,
      lectureId,
      teacherProfileId,
    } = params;

    const skip = (page - 1) * limit;

    const where: any = {
      isDeleted: false,
    };

    if (courseId) where.courseId = courseId;
    if (lectureId) where.lectureId = lectureId;
    if (teacherProfileId) where.teacherProfileId = teacherProfileId;

    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: "insensitive" } },
        { description: { contains: search.trim(), mode: "insensitive" } },
        { taskContent: { contains: search.trim(), mode: "insensitive" } },
        { course: { title: { contains: search.trim(), mode: "insensitive" } } },
        { lecture: { title: { contains: search.trim(), mode: "insensitive" } } },
      ];
    }

    const [records, total] = await Promise.all([
      (this.prisma as any).lectureHomework.findMany({
        where,
        skip,
        take: limit,
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
          lecture: true,
          teacherProfile: {
            include: {
              profile: {
                include: { user: true },
              },
            },
          },
          submissions: true,
        },
      }),
      (this.prisma as any).lectureHomework.count({ where }),
    ]);

    const items = records.map((r: any) => this.mapHomeworkToEntity(r));

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async create(
    courseId: string,
    teacherProfileId: string,
    data: CreateHomeworkDTO
  ): Promise<HomeworkEntity> {
    const created = await (this.prisma as any).lectureHomework.create({
      data: {
        title: data.title,
        description: data.description,
        taskContent: data.taskContent,
        taskUrl: data.taskUrl,
        attachmentUrl: data.attachmentUrl,
        attachmentKey: data.attachmentKey,
        attachmentName: data.attachmentName,
        attachmentType: data.attachmentType,
        attachmentSize: data.attachmentSize ?? 0,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        maxScore: data.maxScore ?? 100,
        sortOrder: data.sortOrder ?? 0,
        lecture: {
          connect: { id: data.lectureId },
        },
        course: {
          connect: { id: courseId },
        },
        teacherProfile: {
          connect: { id: teacherProfileId },
        },
      },
      include: {
        course: true,
        lecture: true,
        teacherProfile: {
          include: {
            profile: {
              include: { user: true },
            },
          },
        },
      },
    });

    return this.mapHomeworkToEntity(created);
  }

  async update(id: string, data: UpdateHomeworkDTO): Promise<HomeworkEntity> {
    const updatePayload: any = {};
    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.taskContent !== undefined) updatePayload.taskContent = data.taskContent;
    if (data.taskUrl !== undefined) updatePayload.taskUrl = data.taskUrl;
    if (data.attachmentUrl !== undefined) updatePayload.attachmentUrl = data.attachmentUrl;
    if (data.attachmentKey !== undefined) updatePayload.attachmentKey = data.attachmentKey;
    if (data.attachmentName !== undefined) updatePayload.attachmentName = data.attachmentName;
    if (data.attachmentType !== undefined) updatePayload.attachmentType = data.attachmentType;
    if (data.attachmentSize !== undefined) updatePayload.attachmentSize = data.attachmentSize;
    if (data.dueDate !== undefined)
      updatePayload.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    if (data.maxScore !== undefined) updatePayload.maxScore = data.maxScore;
    if (data.sortOrder !== undefined) updatePayload.sortOrder = data.sortOrder;
    if (data.isPublished !== undefined) updatePayload.isPublished = data.isPublished;

    const updated = await (this.prisma as any).lectureHomework.update({
      where: { id },
      data: updatePayload,
      include: {
        course: true,
        lecture: true,
        teacherProfile: {
          include: {
            profile: {
              include: { user: true },
            },
          },
        },
        submissions: true,
      },
    });

    return this.mapHomeworkToEntity(updated);
  }

  async softDelete(id: string): Promise<boolean> {
    await (this.prisma as any).lectureHomework.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
    return true;
  }

  async findSubmission(
    homeworkId: string,
    studentId: string
  ): Promise<HomeworkSubmissionEntity | null> {
    const record = await (this.prisma as any).homeworkSubmission.findUnique({
      where: {
        homeworkId_studentId: {
          homeworkId,
          studentId,
        },
      },
      include: {
        student: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!record) return null;
    return this.mapSubmissionToEntity(record);
  }

  async findSubmissionById(submissionId: string): Promise<HomeworkSubmissionEntity | null> {
    const record = await (this.prisma as any).homeworkSubmission.findUnique({
      where: { id: submissionId },
      include: {
        student: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!record) return null;
    return this.mapSubmissionToEntity(record);
  }

  async findSubmissionsByHomeworkId(homeworkId: string): Promise<HomeworkSubmissionEntity[]> {
    const records = await (this.prisma as any).homeworkSubmission.findMany({
      where: { homeworkId },
      orderBy: { submittedAt: "desc" },
      include: {
        student: {
          include: {
            profile: true,
          },
        },
      },
    });

    return records.map((r: any) => this.mapSubmissionToEntity(r));
  }

  async createOrUpdateSubmission(
    homeworkId: string,
    studentId: string,
    data: SubmitHomeworkDTO,
    isLate: boolean
  ): Promise<HomeworkSubmissionEntity> {
    const existing = await (this.prisma as any).homeworkSubmission.findUnique({
      where: {
        homeworkId_studentId: {
          homeworkId,
          studentId,
        },
      },
    });

    const now = new Date();

    if (existing) {
      const updated = await (this.prisma as any).homeworkSubmission.update({
        where: { id: existing.id },
        data: {
          submissionText: data.submissionText !== undefined ? data.submissionText : existing.submissionText,
          submissionUrl: data.submissionUrl !== undefined ? data.submissionUrl : existing.submissionUrl,
          fileUrl: data.fileUrl !== undefined ? data.fileUrl : existing.fileUrl,
          fileKey: data.fileKey !== undefined ? data.fileKey : existing.fileKey,
          fileName: data.fileName !== undefined ? data.fileName : existing.fileName,
          fileType: data.fileType !== undefined ? data.fileType : existing.fileType,
          fileSizeBytes: data.fileSizeBytes !== undefined ? data.fileSizeBytes : existing.fileSizeBytes,
          status: "RESUBMITTED",
          verificationStatus: "PENDING",
          attemptCount: (existing.attemptCount || 1) + 1,
          submittedAt: now,
          isLate,
        },
        include: {
          student: {
            include: { profile: true },
          },
        },
      });

      return this.mapSubmissionToEntity(updated);
    } else {
      const created = await (this.prisma as any).homeworkSubmission.create({
        data: {
          homework: { connect: { id: homeworkId } },
          student: { connect: { id: studentId } },
          submissionText: data.submissionText,
          submissionUrl: data.submissionUrl,
          fileUrl: data.fileUrl,
          fileKey: data.fileKey,
          fileName: data.fileName,
          fileType: data.fileType,
          fileSizeBytes: data.fileSizeBytes ?? 0,
          status: "SUBMITTED",
          verificationStatus: "PENDING",
          attemptCount: 1,
          submittedAt: now,
          isLate,
        },
        include: {
          student: {
            include: { profile: true },
          },
        },
      });

      return this.mapSubmissionToEntity(created);
    }
  }

  async reviewSubmission(
    submissionId: string,
    reviewedByTeacherId: string,
    data: ReviewSubmissionDTO
  ): Promise<HomeworkSubmissionEntity> {
    const updated = await (this.prisma as any).homeworkSubmission.update({
      where: { id: submissionId },
      data: {
        verificationStatus: data.verificationStatus,
        feedback: data.feedback,
        score: data.score,
        reviewedAt: new Date(),
        reviewedByTeacherId,
      },
      include: {
        student: {
          include: { profile: true },
        },
      },
    });

    return this.mapSubmissionToEntity(updated);
  }

  async findLectureWithCourse(lectureId: string): Promise<{
    id: string;
    title: string;
    courseId: string;
    courseTitle: string;
    teacherProfileId: string;
  } | null> {
    const lecture = await this.prisma.courseLesson.findFirst({
      where: { id: lectureId, isDeleted: false },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lecture || !lecture.module?.course) return null;

    return {
      id: lecture.id,
      title: lecture.title,
      courseId: lecture.module.course.id,
      courseTitle: lecture.module.course.title,
      teacherProfileId: lecture.module.course.teacherProfileId,
    };
  }

  async isStudentEnrolled(studentId: string, courseId: string): Promise<boolean> {
    const enrollment = await this.prisma.courseEnrollment.findFirst({
      where: {
        studentId,
        courseId,
        status: "ACTIVE",
      },
    });

    return Boolean(enrollment);
  }

  async getTeacherProfileIdByUserId(userId: string): Promise<string | null> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        teacherProfile: true,
      },
    });

    return profile?.teacherProfile?.id || null;
  }
}
