import { NextFunction, Request, Response } from "express";
import { VerifySignupOtp } from "../../application/use-cases/verify-signup-otp.usecase";
import { setAuthCookies } from "@/app/config/cookie";
import { ApiResponse } from "@/shared/utils/api-response";

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

            return ApiResponse.created(res, result, "Account verified and created successfully");
        } catch (error) {
            next(error);
        }
    };
}
