import { NextFunction, Request, Response } from "express";
import { ChangePassword } from "../../application/use-cases/change-password.usecase";
import { STATUS_CODES } from "@/app/config/status";
import { UnauthorizedError } from "@/app/errors";

export class ChangePasswordController {
    constructor(private readonly changePassword: ChangePassword) { }

    execute = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new UnauthorizedError("Unauthorized");
            }

            const result = await this.changePassword.execute(userId, req.body);

            res.status(STATUS_CODES.OK).json({
                message: result.message,
            });
        } catch (error) {
            next(error);
        }
    };
}
