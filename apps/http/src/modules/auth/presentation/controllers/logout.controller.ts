import { NextFunction, Request, Response } from "express";
import { LogoutUser } from "../../application/use-cases/logout.user.usecase";
import { STATUS_CODES } from "@/app/config/status";
import { clearAuthCookies } from "@/app/config/cookie";

export class LogoutController {
    constructor(private readonly logoutUser: LogoutUser) { }

    execute = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
            const userId = req.body?.userId;

            const result = await this.logoutUser.execute({ refreshToken, userId });

            // Clear HTTP-only auth cookies
            clearAuthCookies(res);

            res.status(STATUS_CODES.OK).json({
                message: result.message,
            });
        } catch (error) {
            next(error);
        }
    };
}
