import { NextFunction, Request, Response } from "express";
import { ResetPassword } from "../../application/use-cases/reset-password.usecase";
import { ApiResponse } from "@/shared/utils/api-response";

export class ResetPasswordController {
    constructor(private readonly resetPassword: ResetPassword) { }

    execute = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, otp, newPassword } = req.body;
            const result = await this.resetPassword.execute({ email, otp, newPassword });

            return ApiResponse.success(res, undefined, result.message);
        } catch (error) {
            next(error);
        }
    };
}
