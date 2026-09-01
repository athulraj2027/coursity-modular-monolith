import { NextFunction, Request, Response } from "express";
import { LogoutUser } from "../../application/use-cases/logout.user.usecase";
import { STATUS_CODES } from "@/app/config/status";

export class LogoutController {
    constructor(private readonly logoutUser: LogoutUser) { }

    execute = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { refreshToken, userId } = req.body || {};
            const result = await this.logoutUser.execute({ refreshToken, userId });

            res.status(STATUS_CODES.OK).json({
                message: result.message,
            });
        } catch (error) {
            next(error);
        }
    };
}
