import { Request, Response, NextFunction } from "express";
import { AdminGetEnrollmentsUseCase } from "../../application/use-cases/admin-get-enrollments.usecase";
import { ApiResponse } from "@/shared";

export class AdminListEnrollmentsController {
  constructor(private readonly adminGetEnrollmentsUseCase?: AdminGetEnrollmentsUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!this.adminGetEnrollmentsUseCase) {
        throw new Error("AdminGetEnrollmentsUseCase not initialized.");
      }
      const { search, status, courseId, paymentMethod, page, limit, sortBy, sortOrder } = req.query;
      const result = await this.adminGetEnrollmentsUseCase.execute({
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
