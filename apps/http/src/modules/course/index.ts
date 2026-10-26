import { PrismaCourseRepository } from "./infrastructure/repositories/prisma-course.repository";
import { PrismaCurriculumRepository } from "./infrastructure/repositories/prisma-curriculum.repository";
import { GetCoursesUseCase } from "./application/use-cases/get-courses.usecase";
import { TeacherCourseUseCase } from "./application/use-cases/teacher-course.usecase";
import { AdminManageCoursesUseCase } from "./application/use-cases/admin-manage-courses.usecase";
import { CourseController } from "./presentation/controllers/course.controller";
import { CourseRoutes } from "./presentation/routes/course.routes";
import { emailService } from "@/infrastructure/email";

export const courseRepository = new PrismaCourseRepository();
export const courseRepo = courseRepository;
const curriculumRepository = new PrismaCurriculumRepository();

const getCoursesUseCase = new GetCoursesUseCase(courseRepository);
const teacherCourseUseCase = new TeacherCourseUseCase(courseRepository, curriculumRepository);
const adminManageCoursesUseCase = new AdminManageCoursesUseCase(courseRepository, emailService);

const courseController = new CourseController(
  getCoursesUseCase,
  teacherCourseUseCase,
  adminManageCoursesUseCase
);

const courseRoutes = new CourseRoutes(courseController);

export * from "./domain/entities/course.entity";
export * from "./domain/dtos/course.dto";
export * from "./domain/repositories/course.repository";
export * from "./infrastructure/repositories/prisma-course.repository";
export * from "./infrastructure/repositories/prisma-curriculum.repository";
export * from "./application/use-cases/get-courses.usecase";
export * from "./application/use-cases/teacher-course.usecase";
export * from "./application/use-cases/admin-manage-courses.usecase";
export * from "./presentation/controllers";
export * from "./presentation/validators/course.validator";
export * from "./presentation/routes/course.routes";

export const courseRouter = courseRoutes.router;
export default courseRouter;
