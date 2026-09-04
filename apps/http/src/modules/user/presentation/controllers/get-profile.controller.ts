import { NextFunction, Request, Response } from "express";
import { GetProfile } from "../../application/use-cases/get-profile.usecase";
import { STATUS_CODES } from "@/app/config/status";
import { UnauthorizedError } from "@/app/errors";

export class GetProfileController {
    constructor(private readonly getProfile: GetProfile) { }

    execute = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new UnauthorizedError("Unauthorized");
            }

            const user = await this.getProfile.execute(userId);

            res.status(STATUS_CODES.OK).json({
                message: "User profile fetched successfully",
                data: { user },
            });
        } catch (error) {
            next(error);
        }
    };
}
