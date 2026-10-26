import { NextFunction, Request, Response } from "express";
import { GetProfile } from "../../application/use-cases/get-profile.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared/utils/api-response";

export class GetProfileController {
    constructor(private readonly getProfile: GetProfile) { }

    execute = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new UnauthorizedError("Unauthorized");
            }

            const user = await this.getProfile.execute(userId);

            return ApiResponse.success(res, { user }, "User profile fetched successfully");
        } catch (error) {
            next(error);
        }
    };
}
