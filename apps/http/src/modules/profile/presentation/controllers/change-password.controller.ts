import { NextFunction, Request, Response } from "express";
import { ChangePassword } from "../../application/use-cases/change-password.usecase";
import { STATUS_CODES } from "@/app/config/status";
import { UnauthorizedError } from "@/app/errors";

export class ChangePasswordController {
    constructor(private readonly changePassword: ChangePassword) {}

    execute = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new UnauthorizedError("Authentication required to change password");
            }

            const { currentPassword, newPassword, confirmPassword } = req.body;

            const result = await this.changePassword.execute({
                userId,
                currentPassword,
                newPassword,
                confirmPassword,
            });

            res.status(STATUS_CODES.OK).json({
                success: true,
                message: result.message,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };
}
