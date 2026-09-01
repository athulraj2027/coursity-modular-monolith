import { NextFunction, Request, Response } from "express";
import { ForgotPassword } from "../../application/use-cases/forgot-password.usecase";
import { STATUS_CODES } from "@/app/config/status";

export class ForgotPasswordController {
    constructor(private readonly forgotPassword: ForgotPassword) { }

    execute = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email } = req.body;
            const result = await this.forgotPassword.execute({ email });

            res.status(STATUS_CODES.OK).json({
                message: result.message,
                data: { email: result.email },
            });
        } catch (error) {
            next(error);
        }
    };
}
