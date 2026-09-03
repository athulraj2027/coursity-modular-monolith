import { NextFunction, Request, Response } from "express";
import { RefreshToken } from "../../application/use-cases/refresh-token.usecase";
import { STATUS_CODES } from "@/app/config/status";
import { setAuthCookies } from "@/app/config/cookie";

export class RefreshController {
    constructor(private readonly refreshTokenUseCase: RefreshToken) { }

    execute = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
            const result = await this.refreshTokenUseCase.execute({ refreshToken });

            // Set new HTTP-only auth cookies
            setAuthCookies(res, {
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
            });

            res.status(STATUS_CODES.OK).json({
                message: "Token refreshed successfully",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };
}
