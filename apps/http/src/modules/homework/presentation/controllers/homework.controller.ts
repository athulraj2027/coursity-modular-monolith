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
import { UnauthorizedError } from "@/app/errors";

export class HomeworkController {
  constructor(
    private readonly createHomeworkUseCase: CreateHomeworkUseCase,
    private readonly getHomeworkByLectureUseCase: GetHomeworkByLectureUseCase,
    private readonly getHomeworkByCourseUseCase: GetHomeworkByCourseUseCase,
    private readonly getHomeworkDetailUseCase: GetHomeworkDetailUseCase,
    private readonly updateHomeworkUseCase: UpdateHomeworkUseCase,
    private readonly deleteHomeworkUseCase: DeleteHomeworkUseCase,
    private readonly submitHomeworkUseCase: SubmitHomeworkUseCase,
    private readonly getMySubmissionUseCase: GetMySubmissionUseCase,
    private readonly getHomeworkSubmissionsUseCase: GetHomeworkSubmissionsUseCase,
    private readonly reviewSubmissionUseCase: ReviewSubmissionUseCase,
    private readonly adminListHomeworkUseCase: AdminListHomeworkUseCase
  ) {}

  createHomework = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      const result = await this.createHomeworkUseCase.execute({
        userId: req.user.userId,
        userRole: req.user.role,
        data: req.body,
      });
      return res.status(201).json({
        success: true,
        data: result,
        message: "Homework assignment created successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getHomeworkByLecture = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      const lectureId = req.params.lectureId as string;
      const result = await this.getHomeworkByLectureUseCase.execute({
        lectureId,
        userId: req.user.userId,
        userRole: req.user.role,
      });
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  getHomeworkByCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      const courseId = req.params.courseId as string;
      const result = await this.getHomeworkByCourseUseCase.execute({
        courseId,
        userId: req.user.userId,
        userRole: req.user.role,
      });
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  getHomeworkDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      const homeworkId = req.params.id as string;
      const result = await this.getHomeworkDetailUseCase.execute({
        homeworkId,
        userId: req.user.userId,
        userRole: req.user.role,
      });
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  updateHomework = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      const homeworkId = req.params.id as string;
      const result = await this.updateHomeworkUseCase.execute({
        homeworkId,
        userId: req.user.userId,
        userRole: req.user.role,
        data: req.body,
      });
      return res.status(200).json({
        success: true,
        data: result,
        message: "Homework updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  deleteHomework = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      const homeworkId = req.params.id as string;
      await this.deleteHomeworkUseCase.execute({
        homeworkId,
        userId: req.user.userId,
        userRole: req.user.role,
      });
      return res.status(200).json({
        success: true,
        message: "Homework assignment deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  submitHomework = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      const homeworkId = req.params.id as string;
      const result = await this.submitHomeworkUseCase.execute({
        homeworkId,
        studentId: req.user.userId,
        userRole: req.user.role,
        data: req.body,
      });
      return res.status(200).json({
        success: true,
        data: result,
        message: "Homework submitted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getMySubmission = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      const homeworkId = req.params.id as string;
      const result = await this.getMySubmissionUseCase.execute({
        homeworkId,
        studentId: req.user.userId,
      });
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  getHomeworkSubmissions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      const homeworkId = req.params.id as string;
      const result = await this.getHomeworkSubmissionsUseCase.execute({
        homeworkId,
        userId: req.user.userId,
        userRole: req.user.role,
      });
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  reviewSubmission = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      const submissionId = req.params.submissionId as string;
      const result = await this.reviewSubmissionUseCase.execute({
        submissionId,
        userId: req.user.userId,
        userRole: req.user.role,
        data: req.body,
      });
      return res.status(200).json({
        success: true,
        data: result,
        message: `Submission marked as ${result.verificationStatus}`,
      });
    } catch (error) {
      next(error);
    }
  };

  adminListHomework = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const search = req.query.search as string | undefined;
      const courseId = req.query.courseId as string | undefined;
      const lectureId = req.query.lectureId as string | undefined;
      const teacherProfileId = req.query.teacherProfileId as string | undefined;

      const result = await this.adminListHomeworkUseCase.execute({
        page,
        limit,
        search,
        courseId,
        lectureId,
        teacherProfileId,
      });

      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}
