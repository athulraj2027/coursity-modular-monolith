import { Request, Response, NextFunction } from "express";
import { TeacherGetLecturesUseCase } from "../../application/use-cases/teacher-get-lectures.usecase";
import { TeacherGetLectureDetailUseCase } from "../../application/use-cases/teacher-get-lecture-detail.usecase";
import { TeacherCreateLectureUseCase } from "../../application/use-cases/teacher-create-lecture.usecase";
import { TeacherUpdateLectureUseCase } from "../../application/use-cases/teacher-update-lecture.usecase";
import { TeacherDeleteLectureUseCase } from "../../application/use-cases/teacher-delete-lecture.usecase";
import { AdminGetLecturesUseCase } from "../../application/use-cases/admin-get-lectures.usecase";
import { AdminGetLectureDetailUseCase } from "../../application/use-cases/admin-get-lecture-detail.usecase";
import { StudentGetLecturesUseCase } from "../../application/use-cases/student-get-lectures.usecase";
import { StudentGetLectureDetailUseCase } from "../../application/use-cases/student-get-lecture-detail.usecase";

import { TeacherGetLecturesController } from "./teacher-get-lectures.controller";
import { TeacherGetLectureDetailController } from "./teacher-get-lecture-detail.controller";
import { TeacherCreateLectureController } from "./teacher-create-lecture.controller";
import { TeacherUpdateLectureController } from "./teacher-update-lecture.controller";
import { TeacherDeleteLectureController } from "./teacher-delete-lecture.controller";
import { AdminGetLecturesController } from "./admin-get-lectures.controller";
import { AdminGetLectureDetailController } from "./admin-get-lecture-detail.controller";
import { StudentGetLecturesController } from "./student-get-lectures.controller";
import { StudentGetLectureDetailController } from "./student-get-lecture-detail.controller";

export class LectureController {
  private readonly teacherGetLecturesController: TeacherGetLecturesController;
  private readonly teacherGetLectureDetailController: TeacherGetLectureDetailController;
  private readonly teacherCreateLectureController: TeacherCreateLectureController;
  private readonly teacherUpdateLectureController: TeacherUpdateLectureController;
  private readonly teacherDeleteLectureController: TeacherDeleteLectureController;
  private readonly adminGetLecturesController: AdminGetLecturesController;
  private readonly adminGetLectureDetailController: AdminGetLectureDetailController;
  private readonly studentGetLecturesController: StudentGetLecturesController;
  private readonly studentGetLectureDetailController: StudentGetLectureDetailController;

  constructor(
    teacherGetLecturesUseCase: TeacherGetLecturesUseCase,
    teacherGetLectureDetailUseCase: TeacherGetLectureDetailUseCase,
    teacherCreateLectureUseCase: TeacherCreateLectureUseCase,
    teacherUpdateLectureUseCase: TeacherUpdateLectureUseCase,
    teacherDeleteLectureUseCase: TeacherDeleteLectureUseCase,
    adminGetLecturesUseCase: AdminGetLecturesUseCase,
    adminGetLectureDetailUseCase: AdminGetLectureDetailUseCase,
    studentGetLecturesUseCase: StudentGetLecturesUseCase,
    studentGetLectureDetailUseCase: StudentGetLectureDetailUseCase
  ) {
    this.teacherGetLecturesController = new TeacherGetLecturesController(teacherGetLecturesUseCase);
    this.teacherGetLectureDetailController = new TeacherGetLectureDetailController(teacherGetLectureDetailUseCase);
    this.teacherCreateLectureController = new TeacherCreateLectureController(teacherCreateLectureUseCase);
    this.teacherUpdateLectureController = new TeacherUpdateLectureController(teacherUpdateLectureUseCase);
    this.teacherDeleteLectureController = new TeacherDeleteLectureController(teacherDeleteLectureUseCase);
    this.adminGetLecturesController = new AdminGetLecturesController(adminGetLecturesUseCase);
    this.adminGetLectureDetailController = new AdminGetLectureDetailController(adminGetLectureDetailUseCase);
    this.studentGetLecturesController = new StudentGetLecturesController(studentGetLecturesUseCase);
    this.studentGetLectureDetailController = new StudentGetLectureDetailController(studentGetLectureDetailUseCase);
  }

  // Teacher handlers
  teacherGetLectures = (req: Request, res: Response, next: NextFunction) =>
    this.teacherGetLecturesController.execute(req, res, next);

  teacherGetLectureDetail = (req: Request, res: Response, next: NextFunction) =>
    this.teacherGetLectureDetailController.execute(req, res, next);

  teacherCreateLecture = (req: Request, res: Response, next: NextFunction) =>
    this.teacherCreateLectureController.execute(req, res, next);

  teacherUpdateLecture = (req: Request, res: Response, next: NextFunction) =>
    this.teacherUpdateLectureController.execute(req, res, next);

  teacherDeleteLecture = (req: Request, res: Response, next: NextFunction) =>
    this.teacherDeleteLectureController.execute(req, res, next);

  // Admin handlers
  adminGetLectures = (req: Request, res: Response, next: NextFunction) =>
    this.adminGetLecturesController.execute(req, res, next);

  adminGetLectureDetail = (req: Request, res: Response, next: NextFunction) =>
    this.adminGetLectureDetailController.execute(req, res, next);

  // Student handlers
  studentGetLectures = (req: Request, res: Response, next: NextFunction) =>
    this.studentGetLecturesController.execute(req, res, next);

  studentGetLectureDetail = (req: Request, res: Response, next: NextFunction) =>
    this.studentGetLectureDetailController.execute(req, res, next);
}
