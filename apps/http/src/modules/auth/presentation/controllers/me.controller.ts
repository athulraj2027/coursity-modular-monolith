import { NextFunction, Request, Response } from "express";
import { GetCurrentUser } from "../../application/use-cases/get-current-user.usecase";
import { STATUS_CODES } from "@/app/config/status";
import { UnauthorizedError } from "@/app/errors";

export class MeController {
    constructor(private readonly getCurrentUser: GetCurrentUser) { }

    execute = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new UnauthorizedError("Unauthorized");
            }

            const user = await this.getCurrentUser.execute(userId);

            res.status(STATUS_CODES.OK).json({
                message: "Current user profile fetched successfully",
                data: { user },
            });
        } catch (error) {
            next(error);
        }
    };
}
