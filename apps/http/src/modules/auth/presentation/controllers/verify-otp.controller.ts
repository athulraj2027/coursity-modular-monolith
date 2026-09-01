import { NextFunction, Request, Response } from "express";
import { STATUS_CODES } from "@/app/config/status";
import { VerifySignupOtp } from "../../application/use-cases/verify-signup-otp.usecase";

export class VerifyOtpController {
    constructor(private readonly verifyOtp: VerifySignupOtp) { }

    execute = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, otp } = req.body;
            const user = await this.verifyOtp.execute({ email, otp });

            res.status(STATUS_CODES.CREATED).json({
                message: "Account verified and created successfully",
                data: user,
            });
        } catch (error) {
            next(error);
        }
    };
}
