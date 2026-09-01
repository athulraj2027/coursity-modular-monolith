import { NextFunction, Request, Response } from "express";
import { ResetPassword } from "../../application/use-cases/reset-password.usecase";
import { STATUS_CODES } from "@/app/config/status";

export class ResetPasswordController {
    constructor(private readonly resetPassword: ResetPassword) { }

    execute = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, otp, newPassword } = req.body;
            const result = await this.resetPassword.execute({ email, otp, newPassword });

            res.status(STATUS_CODES.OK).json({
                message: result.message,
            });
        } catch (error) {
            next(error);
        }
    };
}
