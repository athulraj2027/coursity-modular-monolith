import { Request, Response, NextFunction } from "express";
import { GetInvoicesUseCase } from "../../application/use-cases/get-invoices.usecase";
import { UnauthorizedError } from "@/app/errors";
import { profileRepository } from "@/modules/profile";
import { ApiResponse } from "@/shared/utils/api-response";
import { ITeacherProfileResolver } from "./get-my-subscription.controller";

export class GetInvoicesController {
  constructor(
    private readonly getInvoicesUseCase: GetInvoicesUseCase,
    private readonly profileRepo: ITeacherProfileResolver = profileRepository
  ) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      const teacherProfileId = await this.profileRepo.getOrCreateTeacherProfileId(req.user.userId);
      const invoices = await this.getInvoicesUseCase.execute(teacherProfileId);
      return ApiResponse.success(res, invoices);
    } catch (error) {
      next(error);
    }
  };
}
