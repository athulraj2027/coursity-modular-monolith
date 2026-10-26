import { Request, Response, NextFunction } from "express";
import { AdminDeleteOfferUseCase } from "../../application/use-cases/admin-delete-offer.usecase";
import { ApiResponse } from "@/shared";

export class AdminDeleteOfferController {
  constructor(private readonly adminDeleteOfferUseCase: AdminDeleteOfferUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      await this.adminDeleteOfferUseCase.execute(id);
      return ApiResponse.success(res, undefined, "Offer deleted successfully.");
    } catch (error) {
      next(error);
    }
  };
}
