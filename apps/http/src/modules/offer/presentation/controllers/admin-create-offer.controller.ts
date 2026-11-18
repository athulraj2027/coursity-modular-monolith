import { Request, Response, NextFunction } from "express";
import { AdminCreateOfferUseCase } from "../../application/use-cases/admin-create-offer.usecase";
import { ApiResponse } from "@/shared";
import { createOfferBodySchema } from "../schemas/offer.schema";

export class AdminCreateOfferController {
  constructor(private readonly adminCreateOfferUseCase: AdminCreateOfferUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedBody = createOfferBodySchema.parse(req.body);
      const result = await this.adminCreateOfferUseCase.execute(validatedBody as any);
      return ApiResponse.created(res, result, "Offer created successfully.");
    } catch (error) {
      next(error);
    }
  };
}
