import { PrismaClient } from "@prisma/client";
import defaultPrisma from "@/infrastructure/database/prisma.client";
import { IInterviewTemplateRepository } from "../../domain/repositories/interview-template.repository.interface";
import {
  AdminListTemplatesQueryDto,
  CreateInterviewTemplateDto,
  UpdateInterviewTemplateDto,
} from "../../domain/dtos/admin-interview.dto";
import {
  InterviewTemplateEntity,
  InterviewTemplateVersionEntity,
} from "../../domain/entities/interview.entity";

export class PrismaInterviewTemplateRepository
  implements IInterviewTemplateRepository
{
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  async create(dto: CreateInterviewTemplateDto): Promise<InterviewTemplateEntity> {
    const slug =
      dto.slug ||
      dto.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "") + `-${Date.now().toString(36)}`;

    const template = await (this.prisma as any).interviewTemplate.create({
      data: {
        title: dto.title,
        slug,
        description: dto.description,
        type: (dto.type as any) || "TEACHER_VETTING",
        domain: dto.domain,
        difficulty: (dto.difficulty as any) || "INTERMEDIATE",
        systemPrompt: dto.systemPrompt,
        voiceId: dto.voiceId,
        llmModel: dto.llmModel || "gemini-1.5-flash",
        maxDurationMinutes: dto.maxDurationMinutes || 15,
        totalQuestions: dto.totalQuestions || 5,
        passingScore: dto.passingScore || 70.0,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
        versions: {
          create: {
            version: 1,
            title: dto.title,
            systemPrompt: dto.systemPrompt,
            voiceId: dto.voiceId,
            llmModel: dto.llmModel || "gemini-1.5-flash",
            maxDurationMinutes: dto.maxDurationMinutes || 15,
            totalQuestions: dto.totalQuestions || 5,
            passingScore: dto.passingScore || 70.0,
            changeLog: "Initial template creation",
            createdBy: dto.adminId,
          },
        },
      },
    });

    return this.mapToEntity(template);
  }

  async findById(id: string): Promise<InterviewTemplateEntity | null> {
    const template = await (this.prisma as any).interviewTemplate.findUnique({
      where: { id },
    });
    if (!template) return null;
    return this.mapToEntity(template);
  }

  async findBySlug(slug: string): Promise<InterviewTemplateEntity | null> {
    const template = await (this.prisma as any).interviewTemplate.findUnique({
      where: { slug },
    });
    if (!template) return null;
    return this.mapToEntity(template);
  }

  async findActive(query?: {
    domain?: string;
    difficulty?: string;
    type?: string;
  }): Promise<InterviewTemplateEntity[]> {
    const where: any = { isActive: true };
    if (query?.domain) where.domain = { contains: query.domain, mode: "insensitive" };
    if (query?.difficulty) where.difficulty = query.difficulty;
    if (query?.type) where.type = query.type;

    const templates = await (this.prisma as any).interviewTemplate.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return templates.map((t: any) => this.mapToEntity(t));
  }

  async findAdminAll(
    query: AdminListTemplatesQueryDto
  ): Promise<{ templates: InterviewTemplateEntity[]; total: number }> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 10));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.isActive !== undefined) where.isActive = query.isActive;
    if (query.domain) where.domain = { contains: query.domain, mode: "insensitive" };
    if (query.type) where.type = query.type;
    if (query.difficulty) where.difficulty = query.difficulty;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { domain: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [templates, total] = await Promise.all([
      (this.prisma as any).interviewTemplate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      (this.prisma as any).interviewTemplate.count({ where }),
    ]);

    return {
      templates: templates.map((t: any) => this.mapToEntity(t)),
      total,
    };
  }

  async update(
    id: string,
    dto: UpdateInterviewTemplateDto
  ): Promise<InterviewTemplateEntity> {
    const current = await (this.prisma as any).interviewTemplate.findUnique({
      where: { id },
      include: {
        versions: {
          orderBy: { version: "desc" },
          take: 1,
        },
      },
    });

    if (!current) {
      throw new Error("Template not found");
    }

    const latestVersion =
      current.versions && current.versions.length > 0
        ? current.versions[0].version
        : 1;
    const nextVersion = latestVersion + 1;

    const updated = await (this.prisma as any).interviewTemplate.update({
      where: { id },
      data: {
        title: dto.title !== undefined ? dto.title : current.title,
        description:
          dto.description !== undefined ? dto.description : current.description,
        type: dto.type !== undefined ? (dto.type as any) : current.type,
        domain: dto.domain !== undefined ? dto.domain : current.domain,
        difficulty:
          dto.difficulty !== undefined ? (dto.difficulty as any) : current.difficulty,
        systemPrompt:
          dto.systemPrompt !== undefined ? dto.systemPrompt : current.systemPrompt,
        voiceId: dto.voiceId !== undefined ? dto.voiceId : current.voiceId,
        llmModel: dto.llmModel !== undefined ? dto.llmModel : current.llmModel,
        maxDurationMinutes:
          dto.maxDurationMinutes !== undefined
            ? dto.maxDurationMinutes
            : current.maxDurationMinutes,
        totalQuestions:
          dto.totalQuestions !== undefined
            ? dto.totalQuestions
            : current.totalQuestions,
        passingScore:
          dto.passingScore !== undefined ? dto.passingScore : current.passingScore,
        isActive: dto.isActive !== undefined ? dto.isActive : current.isActive,
        versions: {
          create: {
            version: nextVersion,
            title: dto.title !== undefined ? dto.title : current.title,
            systemPrompt:
              dto.systemPrompt !== undefined
                ? dto.systemPrompt
                : current.systemPrompt,
            voiceId: dto.voiceId !== undefined ? dto.voiceId : current.voiceId,
            llmModel:
              dto.llmModel !== undefined ? dto.llmModel : current.llmModel,
            maxDurationMinutes:
              dto.maxDurationMinutes !== undefined
                ? dto.maxDurationMinutes
                : current.maxDurationMinutes,
            totalQuestions:
              dto.totalQuestions !== undefined
                ? dto.totalQuestions
                : current.totalQuestions,
            passingScore:
              dto.passingScore !== undefined
                ? dto.passingScore
                : current.passingScore,
            changeLog: dto.changeLog || "Template update",
            createdBy: dto.adminId,
          },
        },
      },
    });

    return this.mapToEntity(updated);
  }

  async toggleStatus(
    id: string,
    isActive: boolean
  ): Promise<InterviewTemplateEntity> {
    const updated = await (this.prisma as any).interviewTemplate.update({
      where: { id },
      data: { isActive },
    });
    return this.mapToEntity(updated);
  }

  async getVersions(
    templateId: string
  ): Promise<InterviewTemplateVersionEntity[]> {
    const versions = await (this.prisma as any).interviewTemplateVersion.findMany({
      where: { templateId },
      orderBy: { version: "desc" },
    });

    return versions.map((v: any) => ({
      id: v.id,
      templateId: v.templateId,
      version: v.version,
      title: v.title,
      systemPrompt: v.systemPrompt,
      voiceId: v.voiceId,
      llmModel: v.llmModel,
      maxDurationMinutes: v.maxDurationMinutes,
      totalQuestions: v.totalQuestions,
      passingScore: Number(v.passingScore),
      changeLog: v.changeLog,
      createdBy: v.createdBy,
      createdAt: v.createdAt,
    }));
  }

  private mapToEntity(raw: any): InterviewTemplateEntity {
    return {
      id: raw.id,
      title: raw.title,
      slug: raw.slug,
      description: raw.description,
      type: raw.type,
      domain: raw.domain,
      difficulty: raw.difficulty,
      systemPrompt: raw.systemPrompt,
      voiceId: raw.voiceId,
      llmModel: raw.llmModel,
      maxDurationMinutes: raw.maxDurationMinutes,
      totalQuestions: raw.totalQuestions,
      passingScore: Number(raw.passingScore),
      isActive: raw.isActive,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }
}
