import { NextFunction, Request, Response } from "express";
import { ChangePassword } from "../../application/use-cases/change-password.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared/utils/api-response";

export class ChangePasswordController {
    constructor(private readonly changePassword: ChangePassword) { }

    execute = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new UnauthorizedError("Unauthorized");
            }

            const result = await this.changePassword.execute(userId, req.body);

            return ApiResponse.success(res, undefined, result.message);
        } catch (error) {
            next(error);
        }
    };
}
