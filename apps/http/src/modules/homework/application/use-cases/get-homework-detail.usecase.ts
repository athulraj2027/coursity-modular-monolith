import { IHomeworkRepository } from "../../domain/repositories/homework.repository";
import { HomeworkEntity } from "../../domain/entities/homework.entity";
import { HomeworkNotFoundError, HomeworkAccessDeniedError } from "../../domain/errors/homework.errors";

export interface GetHomeworkDetailInput {
  homeworkId: string;
  userId: string;
  userRole: string;
}

export class GetHomeworkDetailUseCase {
  constructor(private readonly homeworkRepo: IHomeworkRepository) {}

  async execute(input: GetHomeworkDetailInput): Promise<HomeworkEntity> {
    const { homeworkId, userId, userRole } = input;

    const isPrivileged = userRole === "ADMIN" || userRole === "SUPERADMIN";
    const homework = await this.homeworkRepo.findById(homeworkId, isPrivileged);
    if (!homework) {
      throw new HomeworkNotFoundError("Homework assignment not found");
    }

    if (isPrivileged) {
      return homework;
    }

    if (userRole === "TEACHER") {
      const teacherProfileId = await this.homeworkRepo.getTeacherProfileIdByUserId(userId);
      if (teacherProfileId === homework.teacherProfileId) {
        return homework;
      }
      // If not the teacher, check enrollment
      const isEnrolled = await this.homeworkRepo.isStudentEnrolled(userId, homework.courseId);
      if (!isEnrolled) {
        throw new HomeworkAccessDeniedError("You do not have access to this homework assignment");
      }
      const mySubmission = await this.homeworkRepo.findSubmission(homeworkId, userId);
      return { ...homework, mySubmission };
    }

    if (userRole === "STUDENT") {
      const isEnrolled = await this.homeworkRepo.isStudentEnrolled(userId, homework.courseId);
      if (!isEnrolled) {
        throw new HomeworkAccessDeniedError("You must be enrolled in this course to view this homework");
      }
      const mySubmission = await this.homeworkRepo.findSubmission(homeworkId, userId);
      return { ...homework, mySubmission };
    }

    throw new HomeworkAccessDeniedError("Unauthorized access to homework");
  }
}
