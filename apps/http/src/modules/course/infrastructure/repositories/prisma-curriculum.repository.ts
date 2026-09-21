import { PrismaClient } from "@prisma/client";
import defaultPrisma from "@/infrastructure/database/prisma.client";
import { ICurriculumRepository } from "../../domain/repositories/course.repository";
import {
  CourseModuleEntity,
  CourseLessonEntity,
} from "../../domain/entities/course.entity";
import {
  CreateModuleDTO,
  UpdateModuleDTO,
  CreateLessonDTO,
  UpdateLessonDTO,
  ReorderItemDTO,
} from "../../domain/dtos/course.dto";

export class PrismaCurriculumRepository implements ICurriculumRepository {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  // ================= MODULES =================

  async findModuleById(id: string, includeLessons = true): Promise<CourseModuleEntity | null> {
    const module = await (this.prisma as any).courseModule.findUnique({
      where: { id },
      include: includeLessons
        ? {
            lessons: {
              orderBy: { sortOrder: "asc" },
            },
          }
        : undefined,
    });
    return module as CourseModuleEntity | null;
  }

  async getModulesByCourseId(courseId: string, includeLessons = true): Promise<CourseModuleEntity[]> {
    const modules = await (this.prisma as any).courseModule.findMany({
      where: { courseId },
      orderBy: { sortOrder: "asc" },
      include: includeLessons
        ? {
            lessons: {
              orderBy: { sortOrder: "asc" },
            },
          }
        : undefined,
    });
    return modules as CourseModuleEntity[];
  }

  async createModule(data: CreateModuleDTO): Promise<CourseModuleEntity> {
    let sortOrder = data.sortOrder;
    if (sortOrder === undefined) {
      const highest = await (this.prisma as any).courseModule.findFirst({
        where: { courseId: data.courseId },
        orderBy: { sortOrder: "desc" },
        select: { sortOrder: true },
      });
      sortOrder = (highest?.sortOrder ?? -1) + 1;
    }

    const created = await (this.prisma as any).courseModule.create({
      data: {
        courseId: data.courseId,
        title: data.title,
        description: data.description || null,
        sortOrder,
        isPublished: data.isPublished ?? true,
      },
      include: {
        lessons: true,
      },
    });

    await this.recalculateCourseAggregates(data.courseId);
    return created as CourseModuleEntity;
  }

  async updateModule(id: string, data: UpdateModuleDTO): Promise<CourseModuleEntity> {
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
    if (data.isPublished !== undefined) updateData.isPublished = data.isPublished;

    const updated = await (this.prisma as any).courseModule.update({
      where: { id },
      data: updateData,
      include: {
        lessons: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return updated as CourseModuleEntity;
  }

  async deleteModule(id: string): Promise<boolean> {
    const module = await (this.prisma as any).courseModule.findUnique({
      where: { id },
      select: { courseId: true },
    });
    if (!module) return false;

    await (this.prisma as any).courseModule.delete({
      where: { id },
    });

    await this.recalculateCourseAggregates(module.courseId);
    return true;
  }

  async reorderModules(courseId: string, items: ReorderItemDTO[]): Promise<void> {
    await this.prisma.$transaction(
      items.map((item) =>
        (this.prisma as any).courseModule.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
    );
  }

  // ================= LESSONS =================

  async findLessonById(id: string): Promise<CourseLessonEntity | null> {
    const lesson = await (this.prisma as any).courseLesson.findUnique({
      where: { id },
      include: {
        module: {
          select: {
            id: true,
            courseId: true,
            title: true,
          },
        },
      },
    });
    return lesson as CourseLessonEntity | null;
  }

  async getLessonsByModuleId(moduleId: string): Promise<CourseLessonEntity[]> {
    const lessons = await (this.prisma as any).courseLesson.findMany({
      where: { moduleId },
      orderBy: { sortOrder: "asc" },
    });
    return lessons as CourseLessonEntity[];
  }

  async createLesson(data: CreateLessonDTO): Promise<CourseLessonEntity> {
    let sortOrder = data.sortOrder;
    if (sortOrder === undefined) {
      const highest = await (this.prisma as any).courseLesson.findFirst({
        where: { moduleId: data.moduleId },
        orderBy: { sortOrder: "desc" },
        select: { sortOrder: true },
      });
      sortOrder = (highest?.sortOrder ?? -1) + 1;
    }

    const created = await (this.prisma as any).courseLesson.create({
      data: {
        moduleId: data.moduleId,
        title: data.title,
        description: data.description || null,
        lessonType: data.lessonType || "VIDEO",
        durationSeconds: data.durationSeconds ?? 0,
        sortOrder,
        isFreePreview: data.isFreePreview ?? false,
        isPublished: data.isPublished ?? true,
        videoUrl: data.videoUrl || null,
        videoProvider: data.videoProvider || (data.videoUrl ? "S3" : null),
        videoThumbnail: data.videoThumbnail || null,
        articleBody: data.articleBody || null,
        attachments: data.attachments || [],
      },
    });

    const module = await (this.prisma as any).courseModule.findUnique({
      where: { id: data.moduleId },
      select: { courseId: true },
    });
    if (module?.courseId) {
      await this.recalculateCourseAggregates(module.courseId);
    }

    return created as CourseLessonEntity;
  }

  async updateLesson(id: string, data: UpdateLessonDTO): Promise<CourseLessonEntity> {
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.lessonType !== undefined) updateData.lessonType = data.lessonType;
    if (data.durationSeconds !== undefined) updateData.durationSeconds = data.durationSeconds;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
    if (data.isFreePreview !== undefined) updateData.isFreePreview = data.isFreePreview;
    if (data.isPublished !== undefined) updateData.isPublished = data.isPublished;
    if (data.videoUrl !== undefined) updateData.videoUrl = data.videoUrl;
    if (data.videoProvider !== undefined) updateData.videoProvider = data.videoProvider;
    if (data.videoThumbnail !== undefined) updateData.videoThumbnail = data.videoThumbnail;
    if (data.articleBody !== undefined) updateData.articleBody = data.articleBody;
    if (data.attachments !== undefined) updateData.attachments = data.attachments;

    const updated = await (this.prisma as any).courseLesson.update({
      where: { id },
      data: updateData,
    });

    const module = await (this.prisma as any).courseModule.findUnique({
      where: { id: updated.moduleId },
      select: { courseId: true },
    });
    if (module?.courseId) {
      await this.recalculateCourseAggregates(module.courseId);
    }

    return updated as CourseLessonEntity;
  }

  async deleteLesson(id: string): Promise<boolean> {
    const lesson = await (this.prisma as any).courseLesson.findUnique({
      where: { id },
      include: { module: { select: { courseId: true } } },
    });
    if (!lesson) return false;

    await (this.prisma as any).courseLesson.delete({
      where: { id },
    });

    if (lesson.module?.courseId) {
      await this.recalculateCourseAggregates(lesson.module.courseId);
    }

    return true;
  }

  async reorderLessons(moduleId: string, items: ReorderItemDTO[]): Promise<void> {
    await this.prisma.$transaction(
      items.map((item) =>
        (this.prisma as any).courseLesson.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
    );
  }

  // ================= AGGREGATES RECALCULATION =================

  async recalculateCourseAggregates(courseId: string): Promise<void> {
    const modules = await (this.prisma as any).courseModule.findMany({
      where: { courseId },
      include: {
        lessons: {
          select: { durationSeconds: true },
        },
      },
    });

    const totalModules = modules.length;
    let totalLessons = 0;
    let totalDurationSeconds = 0;

    for (const mod of modules) {
      totalLessons += mod.lessons?.length || 0;
      for (const les of mod.lessons || []) {
        totalDurationSeconds += les.durationSeconds || 0;
      }
    }

    await (this.prisma as any).course.update({
      where: { id: courseId },
      data: {
        totalModules,
        totalLessons,
        totalDurationSeconds,
      },
    });
  }
}
