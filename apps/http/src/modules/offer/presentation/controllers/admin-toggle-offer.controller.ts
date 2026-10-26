import { Request, Response, NextFunction } from "express";
import { AdminToggleOfferUseCase } from "../../application/use-cases/admin-toggle-offer.usecase";
import { ApiResponse } from "@/shared";

export class AdminToggleOfferController {
  constructor(private readonly adminToggleOfferUseCase: AdminToggleOfferUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const result = await this.adminToggleOfferUseCase.execute(id);
      return ApiResponse.success(
        res,
        result,
        `Offer '${result.title}' is now ${result.isActive ? "active" : "disabled"}.`
      );
    } catch (error) {
      next(error);
    }
  };
}
