import { Request, Response, NextFunction } from "express";
import { CreateRazorpayOrderUseCase } from "../../application/use-cases/create-razorpay-order.usecase";
import { createRazorpayOrderSchema } from "../validators/subscription.validator";
import { UnauthorizedError } from "@/app/errors";
import { profileRepository } from "@/modules/profile";
import { ApiResponse } from "@/shared/utils/api-response";

export class CreateRazorpayOrderController {
  constructor(private readonly createRazorpayOrderUseCase: CreateRazorpayOrderUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      const validated = createRazorpayOrderSchema.parse(req.body);
      const teacherProfileId = await profileRepository.getOrCreateTeacherProfileId(req.user.userId);

      const result = await this.createRazorpayOrderUseCase.execute({
        planId: validated.planId,
        teacherProfileId,
        userEmail: req.user.email,
        userName: (req.user as any).name || "Instructor",
        billingCycle: validated.billingCycle,
        offerId: validated.offerId,
        phone: validated.phone,
        state: validated.state,
        country: validated.country,
        gstin: validated.gstin,
      });

      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };
}
