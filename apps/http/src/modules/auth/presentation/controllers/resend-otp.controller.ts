import { NextFunction, Request, Response } from "express";
import { ResendSignupOtp } from "../../application/use-cases/resend-signup-otp.usecase";
import { ApiResponse } from "@/shared/utils/api-response";

export class ResendOtpController {
    constructor(private readonly resendOtp: ResendSignupOtp) { }

    execute = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email } = req.body;
            const result = await this.resendOtp.execute({ email });

            return ApiResponse.success(res, { email: result.email }, result.message);
        } catch (error) {
            next(error);
        }
    };
}
