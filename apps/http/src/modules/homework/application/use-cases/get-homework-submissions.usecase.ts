import { IHomeworkRepository } from "../../domain/repositories/homework.repository";
import { HomeworkSubmissionEntity } from "../../domain/entities/homework.entity";
import { HomeworkNotFoundError, HomeworkAccessDeniedError } from "../../domain/errors/homework.errors";

export interface GetHomeworkSubmissionsInput {
  homeworkId: string;
  userId: string;
  userRole: string;
}

export class GetHomeworkSubmissionsUseCase {
  constructor(private readonly homeworkRepo: IHomeworkRepository) {}

  async execute(input: GetHomeworkSubmissionsInput): Promise<{
    homeworkTitle: string;
    courseTitle?: string;
    maxScore: number;
    submissions: HomeworkSubmissionEntity[];
  }> {
    const { homeworkId, userId, userRole } = input;

    const homework = await this.homeworkRepo.findById(homeworkId, true);
    if (!homework) {
      throw new HomeworkNotFoundError("Homework assignment not found");
    }

    if (userRole === "TEACHER") {
      const teacherProfileId = await this.homeworkRepo.getTeacherProfileIdByUserId(userId);
      if (!teacherProfileId || teacherProfileId !== homework.teacherProfileId) {
        throw new HomeworkAccessDeniedError("You can only view submissions for assignments you created");
      }
    } else if (userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
      throw new HomeworkAccessDeniedError("Only teachers and administrators can view all student submissions");
    }

    const submissions = await this.homeworkRepo.findSubmissionsByHomeworkId(homeworkId);

    return {
      homeworkTitle: homework.title,
      courseTitle: homework.courseTitle,
      maxScore: homework.maxScore,
      submissions,
    };
  }
}
