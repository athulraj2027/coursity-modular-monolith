import { NextFunction, Request, Response } from "express";
import { ForgotPassword } from "../../application/use-cases/forgot-password.usecase";
import { ApiResponse } from "@/shared/utils/api-response";

export class ForgotPasswordController {
    constructor(private readonly forgotPassword: ForgotPassword) { }

    execute = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, role } = req.body;
            const result = await this.forgotPassword.execute({ email, role });

            return ApiResponse.success(res, { email: result.email }, result.message);
        } catch (error) {
            next(error);
        }
    };
}
