import { Request, Response, NextFunction } from "express";
import { AdminCreateOfferUseCase } from "../../application/use-cases/admin-create-offer.usecase";
import { ApiResponse } from "@/shared";

export class AdminCreateOfferController {
  constructor(private readonly adminCreateOfferUseCase: AdminCreateOfferUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.adminCreateOfferUseCase.execute(req.body);
      return ApiResponse.created(res, result, "Offer created successfully.");
    } catch (error) {
      next(error);
    }
  };
}
