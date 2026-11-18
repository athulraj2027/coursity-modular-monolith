import { Request, Response, NextFunction } from "express";
import { AdminUpdateOfferUseCase } from "../../application/use-cases/admin-update-offer.usecase";
import { ApiResponse } from "@/shared";
import { updateOfferBodySchema } from "../schemas/offer.schema";

export class AdminUpdateOfferController {
  constructor(private readonly adminUpdateOfferUseCase: AdminUpdateOfferUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const validatedBody = updateOfferBodySchema.parse(req.body);
      const result = await this.adminUpdateOfferUseCase.execute(id, validatedBody as any);
      return ApiResponse.success(res, result, "Offer updated successfully.");
    } catch (error) {
      next(error);
    }
  };
}
