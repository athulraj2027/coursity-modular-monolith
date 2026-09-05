import { NextFunction, Request, Response } from "express";
import { UpdateProfile } from "../../application/use-cases/update-profile.usecase";
import { STATUS_CODES } from "@/app/config/status";
import { UnauthorizedError } from "@/app/errors";

export class UpdateProfileController {
    constructor(private readonly updateProfile: UpdateProfile) { }

    execute = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new UnauthorizedError("Unauthorized");
            }

            const updatedProfile = await this.updateProfile.execute(userId, req.body);

            res.status(STATUS_CODES.OK).json({
                message: "Profile updated successfully",
                data: { profile: updatedProfile },
            });
        } catch (error) {
            next(error);
        }
    };
}
