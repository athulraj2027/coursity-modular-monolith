import { Request, Response, NextFunction } from "express";
import { VerifyRazorpayPaymentUseCase } from "../../application/use-cases/verify-razorpay-payment.usecase";
import { verifyRazorpayPaymentSchema } from "../validators/subscription.validator";
import { UnauthorizedError } from "@/app/errors";
import { profileRepository } from "@/modules/profile";
import { ApiResponse } from "@/shared/utils/api-response";

export class VerifyRazorpayPaymentController {
  constructor(private readonly verifyRazorpayPaymentUseCase: VerifyRazorpayPaymentUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      const validated = verifyRazorpayPaymentSchema.parse(req.body);
      const teacherProfileId = await profileRepository.getOrCreateTeacherProfileId(req.user.userId);

      const result = await this.verifyRazorpayPaymentUseCase.execute({
        orderId: validated.orderId,
        paymentId: validated.paymentId,
        signature: validated.signature,
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

      return ApiResponse.success(
        res,
        result,
        "Payment verified and subscription activated successfully!"
      );
    } catch (error) {
      next(error);
    }
  };
}
