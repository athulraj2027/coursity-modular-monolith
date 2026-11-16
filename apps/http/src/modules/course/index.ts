import { PrismaCourseRepository } from "./infrastructure/repositories/prisma-course.repository";
import { PrismaCurriculumRepository } from "./infrastructure/repositories/prisma-curriculum.repository";
import { GetCoursesUseCase } from "./application/use-cases/get-courses.usecase";
import { TeacherCourseUseCase } from "./application/use-cases/teacher-course.usecase";
import { AdminManageCoursesUseCase } from "./application/use-cases/admin-manage-courses.usecase";
import { CourseController } from "./presentation/controllers/course.controller";
import { CourseRoutes } from "./presentation/routes/course.routes";
import { emailService } from "@/infrastructure/email";
import {
  ITeacherProfileResolver,
  defaultTeacherProfileResolver,
} from "./domain/services/teacher-profile-resolver.service";
import { ICourseNotificationService } from "./domain/ports/course-notification.port";
import {
  ICourseRepository,
  ICurriculumRepository,
} from "./domain/repositories/course.repository";

export interface CreateCourseModuleOptions {
  courseRepository?: ICourseRepository;
  curriculumRepository?: ICurriculumRepository;
  notificationService?: ICourseNotificationService | any;
  profileResolver?: ITeacherProfileResolver;
}

export function createCourseModule(options: CreateCourseModuleOptions = {}) {
  const courseRepo = options.courseRepository || new PrismaCourseRepository();
  const curriculumRepo = options.curriculumRepository || new PrismaCurriculumRepository();
  const notificationSvc = options.notificationService || emailService;
  const profileRes = options.profileResolver || defaultTeacherProfileResolver;

  const getCoursesUseCase = new GetCoursesUseCase(courseRepo);
  const teacherCourseUseCase = new TeacherCourseUseCase(courseRepo, curriculumRepo);
  const adminManageCoursesUseCase = new AdminManageCoursesUseCase(courseRepo, notificationSvc);

  const courseController = new CourseController({
    getCoursesUseCase,
    teacherCourseUseCase,
    adminManageCoursesUseCase,
    profileResolver: profileRes,
  });

  const courseRoutes = new CourseRoutes(courseController);

  return {
    courseRepository: courseRepo,
    curriculumRepository: curriculumRepo,
    getCoursesUseCase,
    teacherCourseUseCase,
    adminManageCoursesUseCase,
    courseController,
    courseRoutes,
    courseRouter: courseRoutes.router,
  };
}

// Default singleton exports for backward compatibility
const defaultModule = createCourseModule();

export const courseRepository = defaultModule.courseRepository;
export const courseRepo = courseRepository;
export const curriculumRepository = defaultModule.curriculumRepository;
export const getCoursesUseCase = defaultModule.getCoursesUseCase;
export const teacherCourseUseCase = defaultModule.teacherCourseUseCase;
export const adminManageCoursesUseCase = defaultModule.adminManageCoursesUseCase;
export const courseController = defaultModule.courseController;
export const courseRoutes = defaultModule.courseRoutes;
export const courseRouter = defaultModule.courseRouter;

export * from "./domain/entities/course.entity";
export * from "./domain/dtos/course.dto";
export * from "./domain/repositories/course.repository";
export * from "./domain/services/teacher-profile-resolver.service";
export * from "./domain/ports/course-notification.port";
export * from "./infrastructure/repositories/prisma-course.repository";
export * from "./infrastructure/repositories/prisma-curriculum.repository";
export * from "./application/use-cases/get-courses.usecase";
export * from "./application/use-cases/teacher-course.usecase";
export * from "./application/use-cases/admin-manage-courses.usecase";
export * from "./presentation/controllers";
export * from "./presentation/validators/course.validator";
export * from "./presentation/routes/course.routes";

export default courseRouter;
