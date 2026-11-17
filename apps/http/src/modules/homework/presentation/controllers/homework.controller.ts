import { Request, Response, NextFunction } from "express";
import { CreateHomeworkUseCase } from "../../application/use-cases/create-homework.usecase";
import { GetHomeworkByLectureUseCase } from "../../application/use-cases/get-homework-by-lecture.usecase";
import { GetHomeworkByCourseUseCase } from "../../application/use-cases/get-homework-by-course.usecase";
import { GetHomeworkDetailUseCase } from "../../application/use-cases/get-homework-detail.usecase";
import { UpdateHomeworkUseCase } from "../../application/use-cases/update-homework.usecase";
import { DeleteHomeworkUseCase } from "../../application/use-cases/delete-homework.usecase";
import { SubmitHomeworkUseCase } from "../../application/use-cases/submit-homework.usecase";
import { GetMySubmissionUseCase } from "../../application/use-cases/get-my-submission.usecase";
import { GetHomeworkSubmissionsUseCase } from "../../application/use-cases/get-homework-submissions.usecase";
import { ReviewSubmissionUseCase } from "../../application/use-cases/review-submission.usecase";
import { AdminListHomeworkUseCase } from "../../application/use-cases/admin-list-homework.usecase";

import { CreateHomeworkController } from "./create-homework.controller";
import { GetHomeworkByLectureController } from "./get-homework-by-lecture.controller";
import { GetHomeworkByCourseController } from "./get-homework-by-course.controller";
import { GetHomeworkDetailController } from "./get-homework-detail.controller";
import { UpdateHomeworkController } from "./update-homework.controller";
import { DeleteHomeworkController } from "./delete-homework.controller";
import { SubmitHomeworkController } from "./submit-homework.controller";
import { GetMySubmissionController } from "./get-my-submission.controller";
import { GetHomeworkSubmissionsController } from "./get-homework-submissions.controller";
import { ReviewSubmissionController } from "./review-submission.controller";
import { AdminListHomeworkController } from "./admin-list-homework.controller";

export interface HomeworkControllerDependencies {
  createHomeworkUseCase: CreateHomeworkUseCase;
  getHomeworkByLectureUseCase: GetHomeworkByLectureUseCase;
  getHomeworkByCourseUseCase: GetHomeworkByCourseUseCase;
  getHomeworkDetailUseCase: GetHomeworkDetailUseCase;
  updateHomeworkUseCase: UpdateHomeworkUseCase;
  deleteHomeworkUseCase: DeleteHomeworkUseCase;
  submitHomeworkUseCase: SubmitHomeworkUseCase;
  getMySubmissionUseCase: GetMySubmissionUseCase;
  getHomeworkSubmissionsUseCase: GetHomeworkSubmissionsUseCase;
  reviewSubmissionUseCase: ReviewSubmissionUseCase;
  adminListHomeworkUseCase: AdminListHomeworkUseCase;
}

export class HomeworkController {
  private readonly createHomeworkController: CreateHomeworkController;
  private readonly getHomeworkByLectureController: GetHomeworkByLectureController;
  private readonly getHomeworkByCourseController: GetHomeworkByCourseController;
  private readonly getHomeworkDetailController: GetHomeworkDetailController;
  private readonly updateHomeworkController: UpdateHomeworkController;
  private readonly deleteHomeworkController: DeleteHomeworkController;
  private readonly submitHomeworkController: SubmitHomeworkController;
  private readonly getMySubmissionController: GetMySubmissionController;
  private readonly getHomeworkSubmissionsController: GetHomeworkSubmissionsController;
  private readonly reviewSubmissionController: ReviewSubmissionController;
  private readonly adminListHomeworkController: AdminListHomeworkController;

  constructor(
    depsOrFirstUseCase: HomeworkControllerDependencies | CreateHomeworkUseCase,
    getHomeworkByLectureUseCase?: GetHomeworkByLectureUseCase,
    getHomeworkByCourseUseCase?: GetHomeworkByCourseUseCase,
    getHomeworkDetailUseCase?: GetHomeworkDetailUseCase,
    updateHomeworkUseCase?: UpdateHomeworkUseCase,
    deleteHomeworkUseCase?: DeleteHomeworkUseCase,
    submitHomeworkUseCase?: SubmitHomeworkUseCase,
    getMySubmissionUseCase?: GetMySubmissionUseCase,
    getHomeworkSubmissionsUseCase?: GetHomeworkSubmissionsUseCase,
    reviewSubmissionUseCase?: ReviewSubmissionUseCase,
    adminListHomeworkUseCase?: AdminListHomeworkUseCase
  ) {
    if ("createHomeworkUseCase" in depsOrFirstUseCase) {
      const deps = depsOrFirstUseCase as HomeworkControllerDependencies;
      this.createHomeworkController = new CreateHomeworkController(deps.createHomeworkUseCase);
      this.getHomeworkByLectureController = new GetHomeworkByLectureController(deps.getHomeworkByLectureUseCase);
      this.getHomeworkByCourseController = new GetHomeworkByCourseController(deps.getHomeworkByCourseUseCase);
      this.getHomeworkDetailController = new GetHomeworkDetailController(deps.getHomeworkDetailUseCase);
      this.updateHomeworkController = new UpdateHomeworkController(deps.updateHomeworkUseCase);
      this.deleteHomeworkController = new DeleteHomeworkController(deps.deleteHomeworkUseCase);
      this.submitHomeworkController = new SubmitHomeworkController(deps.submitHomeworkUseCase);
      this.getMySubmissionController = new GetMySubmissionController(deps.getMySubmissionUseCase);
      this.getHomeworkSubmissionsController = new GetHomeworkSubmissionsController(deps.getHomeworkSubmissionsUseCase);
      this.reviewSubmissionController = new ReviewSubmissionController(deps.reviewSubmissionUseCase);
      this.adminListHomeworkController = new AdminListHomeworkController(deps.adminListHomeworkUseCase);
    } else {
      this.createHomeworkController = new CreateHomeworkController(depsOrFirstUseCase);
      this.getHomeworkByLectureController = new GetHomeworkByLectureController(getHomeworkByLectureUseCase!);
      this.getHomeworkByCourseController = new GetHomeworkByCourseController(getHomeworkByCourseUseCase!);
      this.getHomeworkDetailController = new GetHomeworkDetailController(getHomeworkDetailUseCase!);
      this.updateHomeworkController = new UpdateHomeworkController(updateHomeworkUseCase!);
      this.deleteHomeworkController = new DeleteHomeworkController(deleteHomeworkUseCase!);
      this.submitHomeworkController = new SubmitHomeworkController(submitHomeworkUseCase!);
      this.getMySubmissionController = new GetMySubmissionController(getMySubmissionUseCase!);
      this.getHomeworkSubmissionsController = new GetHomeworkSubmissionsController(getHomeworkSubmissionsUseCase!);
      this.reviewSubmissionController = new ReviewSubmissionController(reviewSubmissionUseCase!);
      this.adminListHomeworkController = new AdminListHomeworkController(adminListHomeworkUseCase!);
    }
  }

  createHomework = (req: Request, res: Response, next: NextFunction) =>
    this.createHomeworkController.execute(req, res, next);

  getHomeworkByLecture = (req: Request, res: Response, next: NextFunction) =>
    this.getHomeworkByLectureController.execute(req, res, next);

  getHomeworkByCourse = (req: Request, res: Response, next: NextFunction) =>
    this.getHomeworkByCourseController.execute(req, res, next);

  getHomeworkDetail = (req: Request, res: Response, next: NextFunction) =>
    this.getHomeworkDetailController.execute(req, res, next);

  updateHomework = (req: Request, res: Response, next: NextFunction) =>
    this.updateHomeworkController.execute(req, res, next);

  deleteHomework = (req: Request, res: Response, next: NextFunction) =>
    this.deleteHomeworkController.execute(req, res, next);

  submitHomework = (req: Request, res: Response, next: NextFunction) =>
    this.submitHomeworkController.execute(req, res, next);

  getMySubmission = (req: Request, res: Response, next: NextFunction) =>
    this.getMySubmissionController.execute(req, res, next);

  getHomeworkSubmissions = (req: Request, res: Response, next: NextFunction) =>
    this.getHomeworkSubmissionsController.execute(req, res, next);

  reviewSubmission = (req: Request, res: Response, next: NextFunction) =>
    this.reviewSubmissionController.execute(req, res, next);

  adminListHomework = (req: Request, res: Response, next: NextFunction) =>
    this.adminListHomeworkController.execute(req, res, next);
}
