import defaultPrisma from "@/infrastructure/database/prisma.client";
import { PrismaLectureRepository } from "./infrastructure/repositories/prisma-lecture.repository";
import { ILectureRepository } from "./domain/repositories/lecture.repository";
import { TeacherGetLecturesUseCase } from "./application/use-cases/teacher-get-lectures.usecase";
import { TeacherGetLectureDetailUseCase } from "./application/use-cases/teacher-get-lecture-detail.usecase";
import { TeacherCreateLectureUseCase } from "./application/use-cases/teacher-create-lecture.usecase";
import { TeacherUpdateLectureUseCase } from "./application/use-cases/teacher-update-lecture.usecase";
import { TeacherDeleteLectureUseCase } from "./application/use-cases/teacher-delete-lecture.usecase";
import { AdminGetLecturesUseCase } from "./application/use-cases/admin-get-lectures.usecase";
import { AdminGetLectureDetailUseCase } from "./application/use-cases/admin-get-lecture-detail.usecase";
import { StudentGetLecturesUseCase } from "./application/use-cases/student-get-lectures.usecase";
import { StudentGetLectureDetailUseCase } from "./application/use-cases/student-get-lecture-detail.usecase";
import { LectureController } from "./presentation/controllers/lecture.controller";
import { createLectureRouter } from "./presentation/routes/lecture.routes";
import {
  ITeacherProfileResolver,
  defaultTeacherProfileResolver,
} from "@/modules/course/domain/services/teacher-profile-resolver.service";

export interface LectureModuleDependencies {
  lectureRepo?: ILectureRepository;
  teacherProfileResolver?: ITeacherProfileResolver;
}

export function createLectureModule(deps?: LectureModuleDependencies) {
  const lectureRepo = deps?.lectureRepo || new PrismaLectureRepository(defaultPrisma);
  const profileResolver = deps?.teacherProfileResolver || defaultTeacherProfileResolver;

  const teacherGetLecturesUseCase = new TeacherGetLecturesUseCase(lectureRepo);
  const teacherGetLectureDetailUseCase = new TeacherGetLectureDetailUseCase(lectureRepo);
  const teacherCreateLectureUseCase = new TeacherCreateLectureUseCase(lectureRepo);
  const teacherUpdateLectureUseCase = new TeacherUpdateLectureUseCase(lectureRepo);
  const teacherDeleteLectureUseCase = new TeacherDeleteLectureUseCase(lectureRepo);

  const adminGetLecturesUseCase = new AdminGetLecturesUseCase(lectureRepo);
  const adminGetLectureDetailUseCase = new AdminGetLectureDetailUseCase(lectureRepo);

  const studentGetLecturesUseCase = new StudentGetLecturesUseCase(lectureRepo);
  const studentGetLectureDetailUseCase = new StudentGetLectureDetailUseCase(lectureRepo);

  const lectureController = new LectureController({
    teacherGetLecturesUseCase,
    teacherGetLectureDetailUseCase,
    teacherCreateLectureUseCase,
    teacherUpdateLectureUseCase,
    teacherDeleteLectureUseCase,
    adminGetLecturesUseCase,
    adminGetLectureDetailUseCase,
    studentGetLecturesUseCase,
    studentGetLectureDetailUseCase,
    profileResolver,
  });

  const lectureRouter = createLectureRouter(lectureController);

  return {
    lectureRouter,
    lectureRepo,
    lectureController,
    useCases: {
      teacherGetLecturesUseCase,
      teacherGetLectureDetailUseCase,
      teacherCreateLectureUseCase,
      teacherUpdateLectureUseCase,
      teacherDeleteLectureUseCase,
      adminGetLecturesUseCase,
      adminGetLectureDetailUseCase,
      studentGetLecturesUseCase,
      studentGetLectureDetailUseCase,
    },
  };
}

const { lectureRouter } = createLectureModule();
export default lectureRouter;

// Domain exports
export * from "./domain/entities/lecture.entity";
export * from "./domain/dtos/lecture.dto";
export * from "./domain/repositories/lecture.repository";
export * from "./domain/errors/lecture.errors";
export * from "./domain/policies";

// Application exports
export * from "./application/use-cases/teacher-get-lectures.usecase";
export * from "./application/use-cases/teacher-get-lecture-detail.usecase";
export * from "./application/use-cases/teacher-create-lecture.usecase";
export * from "./application/use-cases/teacher-update-lecture.usecase";
export * from "./application/use-cases/teacher-delete-lecture.usecase";
export * from "./application/use-cases/admin-get-lectures.usecase";
export * from "./application/use-cases/admin-get-lecture-detail.usecase";
export * from "./application/use-cases/student-get-lectures.usecase";
export * from "./application/use-cases/student-get-lecture-detail.usecase";

// Presentation exports
export * from "./presentation/controllers";
export * from "./presentation/schemas/lecture.schema";
export * from "./presentation/routes/lecture.routes";
