import {
  AdminListTemplatesQueryDto,
  CreateInterviewTemplateDto,
  UpdateInterviewTemplateDto,
} from "../dtos/admin-interview.dto";
import {
  InterviewTemplateEntity,
  InterviewTemplateVersionEntity,
} from "../entities/interview.entity";

export interface IInterviewTemplateRepository {
  create(dto: CreateInterviewTemplateDto): Promise<InterviewTemplateEntity>;

  findById(id: string): Promise<InterviewTemplateEntity | null>;

  findBySlug(slug: string): Promise<InterviewTemplateEntity | null>;

  findActive(query?: {
    domain?: string;
    difficulty?: string;
    type?: string;
  }): Promise<InterviewTemplateEntity[]>;

  findAdminAll(
    query: AdminListTemplatesQueryDto
  ): Promise<{ templates: InterviewTemplateEntity[]; total: number }>;

  update(
    id: string,
    dto: UpdateInterviewTemplateDto
  ): Promise<InterviewTemplateEntity>;

  toggleStatus(id: string, isActive: boolean): Promise<InterviewTemplateEntity>;

  getVersions(templateId: string): Promise<InterviewTemplateVersionEntity[]>;
}
