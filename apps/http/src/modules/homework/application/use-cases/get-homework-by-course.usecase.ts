import {
  IHomeworkQueryRepository,
  IHomeworkContextRepository,
} from "../../domain/repositories/homework.repository";
import { HomeworkEntity } from "../../domain/entities/homework.entity";
import { HomeworkAccessDeniedError } from "../../domain/errors/homework.errors";

export interface GetHomeworkByCourseInput {
  courseId: string;
  userId: string;
  userRole: string;
}

export type GetHomeworkByCourseRepository = IHomeworkQueryRepository &
  IHomeworkContextRepository;

export class GetHomeworkByCourseUseCase {
  constructor(private readonly homeworkRepo: GetHomeworkByCourseRepository) {}

  async execute(input: GetHomeworkByCourseInput): Promise<HomeworkEntity[]> {
    const { courseId, userId, userRole } = input;

    let studentIdToEnrich: string | undefined = undefined;
    let isPrivileged = false;

    if (userRole === "ADMIN" || userRole === "SUPERADMIN") {
      isPrivileged = true;
    } else if (userRole === "TEACHER") {
      const teacherProfileId = await this.homeworkRepo.getTeacherProfileIdByUserId(userId);
      const courseTeacherProfileId = await this.homeworkRepo.getCourseTeacherProfileId(courseId);

      // Check if this teacher is the instructor of this specific course
      const isCourseInstructor = Boolean(
        teacherProfileId && courseTeacherProfileId && teacherProfileId === courseTeacherProfileId
      );

      if (isCourseInstructor) {
        isPrivileged = true;
      } else {
        // Not the instructor of this course; check if enrolled as a student
        const isEnrolled = await this.homeworkRepo.isStudentEnrolled(userId, courseId);
        if (!isEnrolled) {
          throw new HomeworkAccessDeniedError("You do not have access to homework for this course");
        }
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

    return this.homeworkRepo.findByCourseId(courseId, studentIdToEnrich, isPrivileged);
  }
}
