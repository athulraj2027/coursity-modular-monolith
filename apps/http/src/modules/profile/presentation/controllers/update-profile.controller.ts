import { NextFunction, Request, Response } from "express";
import { UpdateProfile } from "../../application/use-cases/update-profile.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared/utils/api-response";

export class UpdateProfileController {
    constructor(private readonly updateProfile: UpdateProfile) { }

    execute = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new UnauthorizedError("Unauthorized");
            }

            const updatedProfile = await this.updateProfile.execute(userId, req.body);

            return ApiResponse.success(res, { profile: updatedProfile }, "Profile updated successfully");
        } catch (error) {
            next(error);
        }
    };
}
