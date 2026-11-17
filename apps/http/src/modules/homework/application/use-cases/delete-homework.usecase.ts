import {
  IHomeworkQueryRepository,
  IHomeworkManagementRepository,
  IHomeworkContextRepository,
} from "../../domain/repositories/homework.repository";
import {
  HomeworkNotFoundError,
  HomeworkAccessDeniedError,
} from "../../domain/errors/homework.errors";

export interface DeleteHomeworkInput {
  homeworkId: string;
  userId: string;
  userRole: string;
}

export type DeleteHomeworkRepository = IHomeworkQueryRepository &
  IHomeworkManagementRepository &
  IHomeworkContextRepository;

export class DeleteHomeworkUseCase {
  constructor(private readonly homeworkRepo: DeleteHomeworkRepository) {}

  async execute(input: DeleteHomeworkInput): Promise<boolean> {
    const { homeworkId, userId, userRole } = input;

    const existing = await this.homeworkRepo.findById(homeworkId, true);
    if (!existing || existing.isDeleted) {
      throw new HomeworkNotFoundError("Homework assignment not found");
    }

    if (userRole === "TEACHER") {
      const teacherProfileId = await this.homeworkRepo.getTeacherProfileIdByUserId(userId);
      if (!teacherProfileId || teacherProfileId !== existing.teacherProfileId) {
        throw new HomeworkAccessDeniedError("You can only delete homework assignments that you created");
      }
    } else if (userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
      throw new HomeworkAccessDeniedError("Only teachers and administrators can delete homework");
    }

    return this.homeworkRepo.softDelete(homeworkId);
  }
}
