import { Request, Response, NextFunction } from "express";
import { AdminGetCouponsUseCase } from "../../application/use-cases/admin-get-coupons.usecase";
import { ApiResponse } from "@/shared";

export class AdminListCouponsController {
  constructor(private readonly adminGetCouponsUseCase?: AdminGetCouponsUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!this.adminGetCouponsUseCase) {
        throw new Error("AdminGetCouponsUseCase not initialized.");
      }
      const { search, isActive, discountType, teacherProfileId, courseId, page, limit, sortBy, sortOrder } = req.query;
      const result = await this.adminGetCouponsUseCase.execute({
        search: search ? String(search) : undefined,
        isActive: isActive !== undefined ? isActive === "true" : undefined,
        discountType: discountType ? (String(discountType) as any) : undefined,
        teacherProfileId: teacherProfileId ? String(teacherProfileId) : undefined,
        courseId: courseId ? String(courseId) : undefined,
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
