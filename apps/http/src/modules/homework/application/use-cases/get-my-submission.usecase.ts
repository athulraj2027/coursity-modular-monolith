import { IHomeworkRepository } from "../../domain/repositories/homework.repository";
import { HomeworkSubmissionEntity } from "../../domain/entities/homework.entity";
import { HomeworkNotFoundError } from "../../domain/errors/homework.errors";

export interface GetMySubmissionInput {
  homeworkId: string;
  studentId: string;
}

export class GetMySubmissionUseCase {
  constructor(private readonly homeworkRepo: IHomeworkRepository) {}

  async execute(input: GetMySubmissionInput): Promise<HomeworkSubmissionEntity | null> {
    const { homeworkId, studentId } = input;

    const homework = await this.homeworkRepo.findById(homeworkId, true);
    if (!homework) {
      throw new HomeworkNotFoundError("Homework assignment not found");
    }

    return this.homeworkRepo.findSubmission(homeworkId, studentId);
  }
}
