import { Request, Response, NextFunction } from "express";
import { TeacherGetEnrollmentsUseCase } from "../../application/use-cases/teacher-get-enrollments.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class TeacherListEnrollmentsController {
  constructor(private readonly teacherGetEnrollmentsUseCase?: TeacherGetEnrollmentsUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!this.teacherGetEnrollmentsUseCase) {
        throw new Error("TeacherGetEnrollmentsUseCase not initialized.");
      }
      const teacherUserId = req.user?.userId;
      if (!teacherUserId) throw new UnauthorizedError("Authentication required.");

      const { search, status, courseId, paymentMethod, page, limit, sortBy, sortOrder } = req.query;
      const result = await this.teacherGetEnrollmentsUseCase.execute({
        teacherUserId,
        search: search ? String(search) : undefined,
        status: status ? (String(status) as any) : undefined,
        courseId: courseId ? String(courseId) : undefined,
        paymentMethod: paymentMethod ? String(paymentMethod) : undefined,
        page: page ? parseInt(String(page), 10) : 1,
        limit: limit ? parseInt(String(limit), 10) : 10,
        sortBy: sortBy ? String(sortBy) : "createdAt",
        sortOrder: sortOrder === "asc" ? "asc" : "desc",
      });
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };
}
