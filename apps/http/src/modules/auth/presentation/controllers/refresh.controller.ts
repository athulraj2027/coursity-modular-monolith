import { NextFunction, Request, Response } from "express";
import { RefreshToken } from "../../application/use-cases/refresh-token.usecase";
import { setAuthCookies, clearAuthCookies } from "@/app/config/cookie";
import { ApiResponse } from "@/shared/utils/api-response";

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

            return ApiResponse.success(res, result, "Token refreshed successfully");
        } catch (error) {
            clearAuthCookies(res);
            next(error);
        }
    };
}
