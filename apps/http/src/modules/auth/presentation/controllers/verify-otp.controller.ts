import { NextFunction, Request, Response } from "express";
import { STATUS_CODES } from "@/app/config/status";
import { VerifySignupOtp } from "../../application/use-cases/verify-signup-otp.usecase";
import { setAuthCookies } from "@/app/config/cookie";

export class VerifyOtpController {
    constructor(private readonly verifyOtp: VerifySignupOtp) { }

    execute = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, otp } = req.body;
            const result = await this.verifyOtp.execute({ email, otp });

            // Set HTTP-only auth cookies if tokens are generated
            if (result.accessToken && result.refreshToken) {
                setAuthCookies(res, {
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken,
                });
            }

            res.status(STATUS_CODES.CREATED).json({
                message: "Account verified and created successfully",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };
}
