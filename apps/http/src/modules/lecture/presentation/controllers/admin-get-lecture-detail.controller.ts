import { Request, Response, NextFunction } from "express";
import { AdminGetLectureDetailUseCase } from "../../application/use-cases/admin-get-lecture-detail.usecase";
import { ApiResponse } from "@/shared";

export class AdminGetLectureDetailController {
  constructor(private readonly adminGetLectureDetailUseCase: AdminGetLectureDetailUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lectureId = req.params.id as string;
      const result = await this.adminGetLectureDetailUseCase.execute(lectureId);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };
}
