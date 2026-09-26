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
import { BadRequestError, UnauthorizedError } from "@/app/errors";
import defaultPrisma from "@/infrastructure/database/prisma.client";

export class LectureController {
  constructor(
    private readonly teacherGetLecturesUseCase: TeacherGetLecturesUseCase,
    private readonly teacherGetLectureDetailUseCase: TeacherGetLectureDetailUseCase,
    private readonly teacherCreateLectureUseCase: TeacherCreateLectureUseCase,
    private readonly teacherUpdateLectureUseCase: TeacherUpdateLectureUseCase,
    private readonly teacherDeleteLectureUseCase: TeacherDeleteLectureUseCase,
    private readonly adminGetLecturesUseCase: AdminGetLecturesUseCase,
    private readonly adminGetLectureDetailUseCase: AdminGetLectureDetailUseCase,
    private readonly studentGetLecturesUseCase: StudentGetLecturesUseCase,
    private readonly studentGetLectureDetailUseCase: StudentGetLectureDetailUseCase
  ) {}

  private async getTeacherProfileId(userId: string): Promise<string> {
    const profile = await defaultPrisma.profile.findUnique({
      where: { userId },
      include: { teacherProfile: true },
    });

    if (!profile?.teacherProfile) {
      const createdTeacher = await defaultPrisma.teacherProfile.create({
        data: {
          profile: {
            connectOrCreate: {
              where: { userId },
              create: { userId },
            },
          },
        },
      });
      return createdTeacher.id;
    }

    return profile.teacherProfile.id;
  }

  // ================= 1. TEACHER LECTURE HANDLERS =================

  teacherGetLectures = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required.");
      const teacherProfileId = await this.getTeacherProfileId(req.user.userId);
      const result = await this.teacherGetLecturesUseCase.execute(teacherProfileId, req.query as any);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  teacherGetLectureDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required.");
      const teacherProfileId = await this.getTeacherProfileId(req.user.userId);
      const lectureId = req.params.id as string;
      const result = await this.teacherGetLectureDetailUseCase.execute(teacherProfileId, lectureId);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  teacherCreateLecture = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required.");
      const teacherProfileId = await this.getTeacherProfileId(req.user.userId);
      const result = await this.teacherCreateLectureUseCase.execute(teacherProfileId, req.body);
      return res.status(201).json({ success: true, data: result, message: "Lecture created successfully." });
    } catch (error) {
      next(error);
    }
  };

  teacherUpdateLecture = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required.");
      const teacherProfileId = await this.getTeacherProfileId(req.user.userId);
      const lectureId = req.params.id as string;
      const result = await this.teacherUpdateLectureUseCase.execute(teacherProfileId, lectureId, req.body);
      return res.status(200).json({ success: true, data: result, message: "Lecture updated successfully." });
    } catch (error) {
      next(error);
    }
  };

  teacherDeleteLecture = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required.");
      const teacherProfileId = await this.getTeacherProfileId(req.user.userId);
      const lectureId = req.params.id as string;
      await this.teacherDeleteLectureUseCase.execute(teacherProfileId, lectureId);
      return res.status(200).json({ success: true, message: "Lecture deleted successfully." });
    } catch (error) {
      next(error);
    }
  };

  // ================= 2. ADMIN LECTURE HANDLERS =================

  adminGetLectures = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.adminGetLecturesUseCase.execute(req.query as any);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  adminGetLectureDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lectureId = req.params.id as string;
      const result = await this.adminGetLectureDetailUseCase.execute(lectureId);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  // ================= 3. STUDENT LECTURE HANDLERS =================

  studentGetLectures = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required.");
      const result = await this.studentGetLecturesUseCase.execute(req.user.userId, req.query as any);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  studentGetLectureDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required.");
      const lectureId = req.params.id as string;
      const result = await this.studentGetLectureDetailUseCase.execute(req.user.userId, lectureId);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}
