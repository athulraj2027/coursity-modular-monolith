import defaultPrisma from "@/infrastructure/database/prisma.client";
import { PrismaHomeworkRepository } from "./infrastructure/repositories/prisma-homework.repository";
import { CreateHomeworkUseCase } from "./application/use-cases/create-homework.usecase";
import { GetHomeworkByLectureUseCase } from "./application/use-cases/get-homework-by-lecture.usecase";
import { GetHomeworkByCourseUseCase } from "./application/use-cases/get-homework-by-course.usecase";
import { GetHomeworkDetailUseCase } from "./application/use-cases/get-homework-detail.usecase";
import { UpdateHomeworkUseCase } from "./application/use-cases/update-homework.usecase";
import { DeleteHomeworkUseCase } from "./application/use-cases/delete-homework.usecase";
import { SubmitHomeworkUseCase } from "./application/use-cases/submit-homework.usecase";
import { GetMySubmissionUseCase } from "./application/use-cases/get-my-submission.usecase";
import { GetHomeworkSubmissionsUseCase } from "./application/use-cases/get-homework-submissions.usecase";
import { ReviewSubmissionUseCase } from "./application/use-cases/review-submission.usecase";
import { AdminListHomeworkUseCase } from "./application/use-cases/admin-list-homework.usecase";
import { HomeworkController } from "./presentation/controllers/homework.controller";
import { createHomeworkRouter } from "./presentation/routes/homework.routes";

export function createHomeworkModule() {
  const homeworkRepo = new PrismaHomeworkRepository(defaultPrisma);

  const createHomeworkUseCase = new CreateHomeworkUseCase(homeworkRepo);
  const getHomeworkByLectureUseCase = new GetHomeworkByLectureUseCase(homeworkRepo);
  const getHomeworkByCourseUseCase = new GetHomeworkByCourseUseCase(homeworkRepo);
  const getHomeworkDetailUseCase = new GetHomeworkDetailUseCase(homeworkRepo);
  const updateHomeworkUseCase = new UpdateHomeworkUseCase(homeworkRepo);
  const deleteHomeworkUseCase = new DeleteHomeworkUseCase(homeworkRepo);
  const submitHomeworkUseCase = new SubmitHomeworkUseCase(homeworkRepo);
  const getMySubmissionUseCase = new GetMySubmissionUseCase(homeworkRepo);
  const getHomeworkSubmissionsUseCase = new GetHomeworkSubmissionsUseCase(homeworkRepo);
  const reviewSubmissionUseCase = new ReviewSubmissionUseCase(homeworkRepo);
  const adminListHomeworkUseCase = new AdminListHomeworkUseCase(homeworkRepo);

  const homeworkController = new HomeworkController(
    createHomeworkUseCase,
    getHomeworkByLectureUseCase,
    getHomeworkByCourseUseCase,
    getHomeworkDetailUseCase,
    updateHomeworkUseCase,
    deleteHomeworkUseCase,
    submitHomeworkUseCase,
    getMySubmissionUseCase,
    getHomeworkSubmissionsUseCase,
    reviewSubmissionUseCase,
    adminListHomeworkUseCase
  );

  const homeworkRouter = createHomeworkRouter(homeworkController);

  return {
    homeworkRouter,
    homeworkRepo,
    homeworkController,
  };
}

const { homeworkRouter } = createHomeworkModule();
export default homeworkRouter;
export * from "./domain/entities/homework.entity";
export * from "./domain/dtos/homework.dto";
export * from "./domain/repositories/homework.repository";
export * from "./domain/errors/homework.errors";
