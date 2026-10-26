import { NextFunction, Request, Response } from "express";
import { GetCurrentUser } from "../../application/use-cases/get-current-user.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared/utils/api-response";

export class MeController {
    constructor(private readonly getCurrentUser: GetCurrentUser) { }

    execute = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new UnauthorizedError("Unauthorized");
            }

            const user = await this.getCurrentUser.execute(userId);

            return ApiResponse.success(res, { user }, "Current user profile fetched successfully");
        } catch (error) {
            next(error);
        }
    };
}
