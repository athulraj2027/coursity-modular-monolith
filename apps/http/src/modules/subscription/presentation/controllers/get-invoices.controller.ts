import { Request, Response, NextFunction } from "express";
import { GetInvoicesUseCase } from "../../application/use-cases/get-invoices.usecase";
import { UnauthorizedError } from "@/app/errors";
import { profileRepository } from "@/modules/profile";
import { ApiResponse } from "@/shared/utils/api-response";

export class GetInvoicesController {
  constructor(private readonly getInvoicesUseCase: GetInvoicesUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      const teacherProfileId = await profileRepository.getOrCreateTeacherProfileId(req.user.userId);
      const invoices = await this.getInvoicesUseCase.execute(teacherProfileId);
      return ApiResponse.success(res, invoices);
    } catch (error) {
      next(error);
    }
  };
}
