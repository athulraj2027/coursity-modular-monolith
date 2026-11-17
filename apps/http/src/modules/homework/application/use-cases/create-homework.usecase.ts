import {
  IHomeworkManagementRepository,
  IHomeworkQueryRepository,
  IHomeworkContextRepository,
} from "../../domain/repositories/homework.repository";
import { CreateHomeworkDTO } from "../../domain/dtos/homework.dto";
import { HomeworkEntity } from "../../domain/entities/homework.entity";
import {
  HomeworkAccessDeniedError,
  HomeworkNotFoundError,
} from "../../domain/errors/homework.errors";
import { HomeworkValidationPolicy } from "../../domain/policies/homework-validation.policy";

export interface CreateHomeworkInput {
  userId: string;
  userRole: string;
  data: CreateHomeworkDTO;
}

export type CreateHomeworkRepository = IHomeworkManagementRepository &
  IHomeworkQueryRepository &
  IHomeworkContextRepository;

export class CreateHomeworkUseCase {
  constructor(private readonly homeworkRepo: CreateHomeworkRepository) {}

  async execute(input: CreateHomeworkInput): Promise<HomeworkEntity> {
    const { userId, userRole, data } = input;

    // 1. Domain Validation Policy
    HomeworkValidationPolicy.validateCreation(data);

    // 2. Verify lecture exists and fetch course & teacherProfile info
    const lectureInfo = await this.homeworkRepo.findLectureWithCourse(data.lectureId);
    if (!lectureInfo) {
      throw new HomeworkNotFoundError("Associated lecture not found");
    }

    // 3. Resolve teacher profile ID & verify ownership
    let teacherProfileId = lectureInfo.teacherProfileId;

    if (userRole === "TEACHER") {
      const userTeacherProfileId = await this.homeworkRepo.getTeacherProfileIdByUserId(userId);
      if (!userTeacherProfileId || userTeacherProfileId !== lectureInfo.teacherProfileId) {
        throw new HomeworkAccessDeniedError("You can only assign homework to lectures of courses you instruct");
      }
      teacherProfileId = userTeacherProfileId;
    } else if (userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
      throw new HomeworkAccessDeniedError("Only instructors and administrators can create homework");
    }

    // 4. Parse dueDate and normalize maxScore using domain policy
    const parsedDueDate = HomeworkValidationPolicy.parseDueDate(data.dueDate);
    const normalizedMaxScore = HomeworkValidationPolicy.normalizeMaxScore(data.maxScore, 100);

    return this.homeworkRepo.create(lectureInfo.courseId, teacherProfileId, {
      ...data,
      title: data.title.trim(),
      description: data.description ? data.description.trim() : null,
      taskContent: data.taskContent ? data.taskContent.trim() : null,
      taskUrl: data.taskUrl ? data.taskUrl.trim() : null,
      dueDate: parsedDueDate,
      maxScore: normalizedMaxScore,
    });
  }
}
