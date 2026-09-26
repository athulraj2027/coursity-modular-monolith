import { PrismaClient, Prisma } from "@prisma/client";
import { ILectureRepository } from "../../domain/repositories/lecture.repository";
import { LectureEntity, LiveClassStatus } from "../../domain/entities/lecture.entity";
import {
  CreateLectureDTO,
  UpdateLectureDTO,
  LectureFilterParams,
  PaginatedLecturesResult,
} from "../../domain/dtos/lecture.dto";

export class PrismaLectureRepository implements ILectureRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private mapToEntity(record: any, studentId?: string): LectureEntity {
    const course = record.module?.course;
    const teacherUser = course?.teacherProfile?.profile?.user;
    const progress = studentId && record.lessonProgress && record.lessonProgress.length > 0
      ? record.lessonProgress[0]
      : null;

    return {
      id: record.id,
      moduleId: record.moduleId,
      title: record.title,
      description: record.description,
      scheduledAt: record.scheduledAt,
      durationSeconds: record.durationSeconds,
      sortOrder: record.sortOrder,
      liveStatus: record.liveStatus as LiveClassStatus,
      isLiveNow: record.isLiveNow,
      isPublished: record.isPublished,
      isDeleted: record.isDeleted ?? false,
      deletedAt: record.deletedAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,

      // Relations
      courseId: course?.id,
      courseTitle: course?.title,
      courseSlug: course?.slug,
      courseThumbnail: course?.thumbnail,
      moduleTitle: record.module?.title,
      teacherId: course?.teacherProfile?.id,
      teacherName: teacherUser?.name || "Instructor",
      teacherAvatar: course?.teacherProfile?.profile?.avatar || null,
      attendedLive: progress?.attendedLive ?? false,
      isCompleted: progress?.isCompleted ?? false,
      enrolledStudentsCount: record._count?.lessonProgress ?? undefined,
    };
  }

  async findById(id: string, includeDeleted = false): Promise<LectureEntity | null> {
    const record = await this.prisma.courseLesson.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
      include: {
        module: {
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
          },
        },
        _count: {
          select: { lessonProgress: true },
        },
      },
    });

    if (!record) return null;
    return this.mapToEntity(record);
  }

  async findCourseWithDefaultModule(
    courseId: string
  ): Promise<{ id: string; teacherProfileId: string; defaultModuleId: string } | null> {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
      },
    });

    if (!course) return null;

    let defaultModuleId = course.modules[0]?.id;
    if (!defaultModuleId) {
      const createdModule = await this.prisma.courseModule.create({
        data: {
          courseId: course.id,
          title: "Main Curriculum",
          sortOrder: 0,
        },
      });
      defaultModuleId = createdModule.id;
    }

    return {
      id: course.id,
      teacherProfileId: course.teacherProfileId,
      defaultModuleId,
    };
  }

  async findManyTeacherLectures(
    teacherProfileId: string,
    params: LectureFilterParams
  ): Promise<PaginatedLecturesResult<LectureEntity>> {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.CourseLessonWhereInput = {
      isDeleted: false,
      module: {
        course: {
          teacherProfileId,
          ...(params.courseId ? { id: params.courseId } : {}),
        },
      },
    };

    if (params.status && params.status !== "all") {
      where.liveStatus = params.status as any;
    }

    if (params.search && params.search.trim()) {
      const q = params.search.trim();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { module: { course: { title: { contains: q, mode: "insensitive" } } } },
      ];
    }

    let orderBy: Prisma.CourseLessonOrderByWithRelationInput = { scheduledAt: "asc" };
    if (params.sort === "startTime-desc") {
      orderBy = { scheduledAt: "desc" };
    } else if (params.sort === "created-desc") {
      orderBy = { createdAt: "desc" };
    } else if (params.sort === "created-asc") {
      orderBy = { createdAt: "asc" };
    } else if (params.sort === "title-asc") {
      orderBy = { title: "asc" };
    }

    const [records, total] = await Promise.all([
      this.prisma.courseLesson.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          module: {
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
            },
          },
          _count: {
            select: { lessonProgress: true },
          },
        },
      }),
      this.prisma.courseLesson.count({ where }),
    ]);

    return {
      items: records.map((r) => this.mapToEntity(r)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findManyAdminLectures(
    params: LectureFilterParams
  ): Promise<PaginatedLecturesResult<LectureEntity>> {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.CourseLessonWhereInput = {
      isDeleted: false,
    };

    if (params.courseId) {
      where.module = { courseId: params.courseId };
    }

    if (params.teacherProfileId) {
      where.module = {
        course: { teacherProfileId: params.teacherProfileId },
      };
    }

    if (params.status && params.status !== "all") {
      where.liveStatus = params.status as any;
    }

    if (params.search && params.search.trim()) {
      const q = params.search.trim();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { module: { course: { title: { contains: q, mode: "insensitive" } } } },
      ];
    }

    let orderBy: Prisma.CourseLessonOrderByWithRelationInput = { scheduledAt: "asc" };
    if (params.sort === "startTime-desc") {
      orderBy = { scheduledAt: "desc" };
    } else if (params.sort === "created-desc") {
      orderBy = { createdAt: "desc" };
    } else if (params.sort === "title-asc") {
      orderBy = { title: "asc" };
    }

    const [records, total] = await Promise.all([
      this.prisma.courseLesson.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          module: {
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
            },
          },
          _count: {
            select: { lessonProgress: true },
          },
        },
      }),
      this.prisma.courseLesson.count({ where }),
    ]);

    return {
      items: records.map((r) => this.mapToEntity(r)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findManyStudentLectures(
    studentId: string,
    params: LectureFilterParams
  ): Promise<PaginatedLecturesResult<LectureEntity>> {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.CourseLessonWhereInput = {
      isDeleted: false,
      isPublished: true,
      module: {
        course: {
          enrollments: {
            some: {
              studentId,
              status: "ACTIVE",
            },
          },
          ...(params.courseId ? { id: params.courseId } : {}),
        },
      },
    };

    if (params.status && params.status !== "all") {
      where.liveStatus = params.status as any;
    }

    if (params.search && params.search.trim()) {
      const q = params.search.trim();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { module: { course: { title: { contains: q, mode: "insensitive" } } } },
      ];
    }

    let orderBy: Prisma.CourseLessonOrderByWithRelationInput = { scheduledAt: "asc" };
    if (params.sort === "startTime-desc") {
      orderBy = { scheduledAt: "desc" };
    } else if (params.sort === "created-desc") {
      orderBy = { createdAt: "desc" };
    }

    const [records, total] = await Promise.all([
      this.prisma.courseLesson.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          module: {
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
            },
          },
          lessonProgress: {
            where: {
              enrollment: { studentId },
            },
          },
        },
      }),
      this.prisma.courseLesson.count({ where }),
    ]);

    return {
      items: records.map((r) => this.mapToEntity(r, studentId)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findConflictingLecture(
    teacherProfileId: string,
    startTime: Date,
    endTime: Date,
    excludeLectureId?: string
  ): Promise<LectureEntity | null> {
    const activeLectures = await this.prisma.courseLesson.findMany({
      where: {
        isDeleted: false,
        liveStatus: {
          notIn: ["CANCELLED", "COMPLETED"],
        },
        module: {
          course: {
            teacherProfileId,
          },
        },
        ...(excludeLectureId ? { id: { not: excludeLectureId } } : {}),
      },
      include: {
        module: {
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
          },
        },
      },
    });

    const newStartMs = startTime.getTime();
    const newEndMs = endTime.getTime();

    for (const record of activeLectures) {
      if (record.scheduledAt) {
        const existingStartMs = new Date(record.scheduledAt).getTime();
        const durationMs = (record.durationSeconds || 3600) * 1000;
        const existingEndMs = existingStartMs + durationMs;

        // Overlap formula: (existingStart < newEnd) && (existingEnd > newStart)
        if (existingStartMs < newEndMs && existingEndMs > newStartMs) {
          return this.mapToEntity(record);
        }
      }

      if (record.isLiveNow || record.liveStatus === "LIVE_NOW") {
        const now = Date.now();
        if (newStartMs <= now && newEndMs >= now) {
          return this.mapToEntity(record);
        }
      }
    }

    return null;
  }

  async createLecture(
    courseId: string,
    moduleId: string,
    data: CreateLectureDTO
  ): Promise<LectureEntity> {
    const record = await (this.prisma as any).courseLesson.create({
      data: {
        moduleId,
        title: data.title,
        description: data.description ?? null,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        durationSeconds: data.durationSeconds ?? 3600,
        sortOrder: data.sortOrder ?? 0,
        liveStatus: "SCHEDULED",
        isLiveNow: false,
        isPublished: true,
        isDeleted: false,
      },
      include: {
        module: {
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
          },
        },
      },
    });

    return this.mapToEntity(record);
  }

  async updateLecture(id: string, data: UpdateLectureDTO): Promise<LectureEntity> {
    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.scheduledAt !== undefined) {
      updateData.scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : null;
    }
    if (data.durationSeconds !== undefined) updateData.durationSeconds = data.durationSeconds;
    if (data.liveStatus !== undefined) updateData.liveStatus = data.liveStatus as any;
    if (data.isLiveNow !== undefined) updateData.isLiveNow = data.isLiveNow;
    if (data.isPublished !== undefined) updateData.isPublished = data.isPublished;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;

    const record = await (this.prisma as any).courseLesson.update({
      where: { id },
      data: updateData,
      include: {
        module: {
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
          },
        },
        _count: {
          select: { lessonProgress: true },
        },
      },
    });

    return this.mapToEntity(record);
  }

  async softDeleteLecture(id: string): Promise<boolean> {
    await this.prisma.courseLesson.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        isPublished: false,
      },
    });
    return true;
  }
}
