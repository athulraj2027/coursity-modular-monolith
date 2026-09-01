import { NextFunction, Request, Response } from "express";
import { RefreshToken } from "../../application/use-cases/refresh-token.usecase";
import { STATUS_CODES } from "@/app/config/status";

export class RefreshController {
    constructor(private readonly refreshTokenUseCase: RefreshToken) { }

    execute = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { refreshToken } = req.body;
            const result = await this.refreshTokenUseCase.execute({ refreshToken });

            res.status(STATUS_CODES.OK).json({
                message: "Token refreshed successfully",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };
}
