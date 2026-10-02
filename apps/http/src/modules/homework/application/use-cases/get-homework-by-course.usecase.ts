import { IHomeworkRepository } from "../../domain/repositories/homework.repository";
import { HomeworkEntity } from "../../domain/entities/homework.entity";
import { HomeworkAccessDeniedError } from "../../domain/errors/homework.errors";

export interface GetHomeworkByCourseInput {
  courseId: string;
  userId: string;
  userRole: string;
}

export class GetHomeworkByCourseUseCase {
  constructor(private readonly homeworkRepo: IHomeworkRepository) {}

  async execute(input: GetHomeworkByCourseInput): Promise<HomeworkEntity[]> {
    const { courseId, userId, userRole } = input;

    let studentIdToEnrich: string | undefined = undefined;

    if (userRole === "ADMIN" || userRole === "SUPERADMIN") {
      // Admin access
    } else if (userRole === "TEACHER") {
      const teacherProfileId = await this.homeworkRepo.getTeacherProfileIdByUserId(userId);
      // Teacher can access if teaching or enrolled
      const isEnrolled = await this.homeworkRepo.isStudentEnrolled(userId, courseId);
      if (!teacherProfileId && !isEnrolled) {
        throw new HomeworkAccessDeniedError("You do not have access to homework for this course");
      }
      if (isEnrolled && !teacherProfileId) {
        studentIdToEnrich = userId;
      }
    } else if (userRole === "STUDENT") {
      const isEnrolled = await this.homeworkRepo.isStudentEnrolled(userId, courseId);
      if (!isEnrolled) {
        throw new HomeworkAccessDeniedError("You must be enrolled in this course to access homework");
      }
      studentIdToEnrich = userId;
    } else {
      throw new HomeworkAccessDeniedError("Unauthorized to view course homework");
    }

    const isPrivileged = userRole === "ADMIN" || userRole === "SUPERADMIN" || userRole === "TEACHER";
    return this.homeworkRepo.findByCourseId(courseId, studentIdToEnrich, isPrivileged);
  }
}
