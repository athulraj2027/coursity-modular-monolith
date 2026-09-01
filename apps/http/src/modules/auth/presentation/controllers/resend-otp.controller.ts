import { NextFunction, Request, Response } from "express";
import { STATUS_CODES } from "@/app/config/status";
import { ResendSignupOtp } from "../../application/use-cases/resend-signup-otp.usecase";

export class ResendOtpController {
    constructor(private readonly resendOtp: ResendSignupOtp) { }

    execute = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email } = req.body;
            const result = await this.resendOtp.execute({ email });

            res.status(STATUS_CODES.OK).json({
                message: result.message,
                data: { email: result.email },
            });
        } catch (error) {
            next(error);
        }
    };
}
