import { PrismaClient, Prisma } from "@prisma/client";
import { INoteRepository } from "../../domain/repositories/note.repository";
import { NoteEntity } from "../../domain/entities/note.entity";
import {
  CreateNoteDTO,
  UpdateNoteDTO,
  NoteFilterParams,
  PaginatedNotesResult,
} from "../../domain/dtos/note.dto";

export class PrismaNoteRepository implements INoteRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private mapToEntity(record: any): NoteEntity {
    const course = record.course;
    const lecture = record.lecture;
    const teacherUser = record.teacherProfile?.profile?.user || course?.teacherProfile?.profile?.user;

    return {
      id: record.id,
      name: record.name,
      description: record.description,
      fileUrl: record.fileUrl,
      fileKey: record.fileKey,
      fileType: record.fileType,
      fileExtension: record.fileExtension,
      fileSizeBytes: record.fileSizeBytes ?? 0,
      lectureId: record.lectureId,
      courseId: record.courseId,
      teacherProfileId: record.teacherProfileId,
      sortOrder: record.sortOrder,
      isPublished: record.isPublished,
      isDeleted: record.isDeleted ?? false,
      deletedAt: record.deletedAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,

      // Relations
      lectureTitle: lecture?.title,
      courseTitle: course?.title,
      courseSlug: course?.slug,
      teacherName: teacherUser?.name || "Instructor",
      teacherAvatar: record.teacherProfile?.profile?.avatar || course?.teacherProfile?.profile?.avatar || null,
    };
  }

  async findById(id: string, includeDeleted = false): Promise<NoteEntity | null> {
    const record = await (this.prisma as any).lectureNote.findFirst({
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
      },
    });

    if (!record) return null;
    return this.mapToEntity(record);
  }

  async findByLectureId(lectureId: string, includeDeleted = false): Promise<NoteEntity[]> {
    const records = await (this.prisma as any).lectureNote.findMany({
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
      },
    });

    return records.map((r: any) => this.mapToEntity(r));
  }

  async findByCourseId(courseId: string, includeDeleted = false): Promise<NoteEntity[]> {
    const records = await (this.prisma as any).lectureNote.findMany({
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
      },
    });

    return records.map((r: any) => this.mapToEntity(r));
  }

  async findManyAdmin(params: NoteFilterParams): Promise<PaginatedNotesResult<NoteEntity>> {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 10));
    const skip = (page - 1) * limit;

    const where: any = {
      isDeleted: false,
    };

    if (params.courseId) where.courseId = params.courseId;
    if (params.lectureId) where.lectureId = params.lectureId;
    if (params.teacherProfileId) where.teacherProfileId = params.teacherProfileId;
    if (params.fileExtension) {
      where.fileExtension = {
        equals: params.fileExtension.toLowerCase().replace(/^\./, ""),
        mode: "insensitive",
      };
    }

    if (params.search && params.search.trim()) {
      const q = params.search.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { course: { title: { contains: q, mode: "insensitive" } } },
        { lecture: { title: { contains: q, mode: "insensitive" } } },
        { teacherProfile: { profile: { user: { name: { contains: q, mode: "insensitive" } } } } },
      ];
    }

    let orderBy: any = { createdAt: "desc" };
    if (params.sort === "name-asc") orderBy = { name: "asc" };
    else if (params.sort === "name-desc") orderBy = { name: "desc" };
    else if (params.sort === "created-asc") orderBy = { createdAt: "asc" };

    const [records, total] = await Promise.all([
      (this.prisma as any).lectureNote.findMany({
        where,
        skip,
        take: limit,
        orderBy,
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
      }),
      (this.prisma as any).lectureNote.count({ where }),
    ]);

    return {
      items: records.map((r: any) => this.mapToEntity(r)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(
    courseId: string,
    teacherProfileId: string,
    data: CreateNoteDTO
  ): Promise<NoteEntity> {
    const record = await (this.prisma as any).lectureNote.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        fileUrl: data.fileUrl,
        fileKey: data.fileKey,
        fileType: data.fileType,
        fileExtension: data.fileExtension ?? null,
        fileSizeBytes: data.fileSizeBytes ?? 0,
        sortOrder: data.sortOrder ?? 0,
        lectureId: data.lectureId,
        courseId,
        teacherProfileId,
        isPublished: true,
        isDeleted: false,
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

    return this.mapToEntity(record);
  }

  async update(id: string, data: UpdateNoteDTO): Promise<NoteEntity> {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.fileUrl !== undefined) updateData.fileUrl = data.fileUrl;
    if (data.fileKey !== undefined) updateData.fileKey = data.fileKey;
    if (data.fileType !== undefined) updateData.fileType = data.fileType;
    if (data.fileExtension !== undefined) updateData.fileExtension = data.fileExtension;
    if (data.fileSizeBytes !== undefined) updateData.fileSizeBytes = data.fileSizeBytes;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
    if (data.isPublished !== undefined) updateData.isPublished = data.isPublished;

    const record = await (this.prisma as any).lectureNote.update({
      where: { id },
      data: updateData,
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

    return this.mapToEntity(record);
  }

  async softDelete(id: string): Promise<boolean> {
    await (this.prisma as any).lectureNote.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        isPublished: false,
      },
    });
    return true;
  }

  async hardDelete(id: string): Promise<boolean> {
    await (this.prisma as any).lectureNote.delete({
      where: { id },
    });
    return true;
  }

  async countByLectureId(lectureId: string): Promise<number> {
    return (this.prisma as any).lectureNote.count({
      where: {
        lectureId,
        isDeleted: false,
      },
    });
  }

  async countByCourseId(courseId: string): Promise<number> {
    return (this.prisma as any).lectureNote.count({
      where: {
        courseId,
        isDeleted: false,
      },
    });
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
