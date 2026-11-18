import {
  IHomeworkQueryRepository,
  IHomeworkManagementRepository,
  IHomeworkContextRepository,
} from "../../domain/repositories/homework.repository";
import { UpdateHomeworkDTO } from "../../domain/dtos/homework.dto";
import { HomeworkEntity } from "../../domain/entities/homework.entity";
import {
  HomeworkNotFoundError,
  HomeworkAccessDeniedError,
} from "../../domain/errors/homework.errors";
import { HomeworkValidationPolicy } from "../../domain/policies/homework-validation.policy";

export interface UpdateHomeworkInput {
  homeworkId: string;
  userId: string;
  userRole: string;
  data: UpdateHomeworkDTO;
}

export type UpdateHomeworkRepository = IHomeworkQueryRepository &
  IHomeworkManagementRepository &
  IHomeworkContextRepository;

export class UpdateHomeworkUseCase {
  constructor(private readonly homeworkRepo: UpdateHomeworkRepository) {}

  async execute(input: UpdateHomeworkInput): Promise<HomeworkEntity> {
    const { homeworkId, userId, userRole, data } = input;

    const existing = await this.homeworkRepo.findById(homeworkId, true);
    if (!existing || existing.isDeleted) {
      throw new HomeworkNotFoundError("Homework assignment not found");
    }

    // Ownership check
    if (userRole === "TEACHER") {
      const teacherProfileId = await this.homeworkRepo.getTeacherProfileIdByUserId(userId);
      if (!teacherProfileId || teacherProfileId !== existing.teacherProfileId) {
        throw new HomeworkAccessDeniedError("You can only modify homework assignments that you created");
      }
    } else if (userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
      throw new HomeworkAccessDeniedError("Only teachers and administrators can modify homework");
    }

    // Domain validation
    HomeworkValidationPolicy.validateUpdate(data);

    let parsedDueDate: Date | null | undefined = undefined;
    if (data.dueDate !== undefined) {
      parsedDueDate = HomeworkValidationPolicy.parseDueDate(data.dueDate);
    }

    return this.homeworkRepo.update(homeworkId, {
      ...data,
      title: data.title !== undefined ? data.title.trim() : undefined,
      description: data.description !== undefined ? (data.description ? data.description.trim() : null) : undefined,
      taskContent: data.taskContent !== undefined ? (data.taskContent ? data.taskContent.trim() : null) : undefined,
      taskUrl: data.taskUrl !== undefined ? (data.taskUrl ? data.taskUrl.trim() : null) : undefined,
      dueDate: parsedDueDate,
      maxScore: data.maxScore !== undefined ? HomeworkValidationPolicy.normalizeMaxScore(data.maxScore) : undefined,
    });
  }
}
