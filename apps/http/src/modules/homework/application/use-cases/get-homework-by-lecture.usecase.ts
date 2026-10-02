import { IHomeworkRepository } from "../../domain/repositories/homework.repository";
import { HomeworkEntity } from "../../domain/entities/homework.entity";
import { HomeworkNotFoundError, HomeworkAccessDeniedError } from "../../domain/errors/homework.errors";

export interface GetHomeworkByLectureInput {
  lectureId: string;
  userId: string;
  userRole: string;
}

export class GetHomeworkByLectureUseCase {
  constructor(private readonly homeworkRepo: IHomeworkRepository) {}

  async execute(input: GetHomeworkByLectureInput): Promise<HomeworkEntity[]> {
    const { lectureId, userId, userRole } = input;

    // 1. Verify lecture exists
    const lectureInfo = await this.homeworkRepo.findLectureWithCourse(lectureId);
    if (!lectureInfo) {
      throw new HomeworkNotFoundError("Lecture not found");
    }

    // 2. Authorization guard
    let studentIdToEnrich: string | undefined = undefined;

    if (userRole === "ADMIN" || userRole === "SUPERADMIN") {
      // Admins have global access
    } else if (userRole === "TEACHER") {
      const teacherProfileId = await this.homeworkRepo.getTeacherProfileIdByUserId(userId);
      if (teacherProfileId !== lectureInfo.teacherProfileId) {
        const isEnrolled = await this.homeworkRepo.isStudentEnrolled(userId, lectureInfo.courseId);
        if (!isEnrolled) {
          throw new HomeworkAccessDeniedError("You do not have access to homework for this lecture");
        }
        studentIdToEnrich = userId;
      }
    } else if (userRole === "STUDENT") {
      const isEnrolled = await this.homeworkRepo.isStudentEnrolled(userId, lectureInfo.courseId);
      if (!isEnrolled) {
        throw new HomeworkAccessDeniedError("You must be enrolled in this course to access homework");
      }
      studentIdToEnrich = userId;
    } else {
      throw new HomeworkAccessDeniedError("Unauthorized to view homework");
    }

    const isPrivileged = userRole === "ADMIN" || userRole === "SUPERADMIN" || userRole === "TEACHER";
    return this.homeworkRepo.findByLectureId(lectureId, studentIdToEnrich, isPrivileged);
  }
}
