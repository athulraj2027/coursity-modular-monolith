import { NextFunction, Request, Response } from "express";
import { UpdateProfile } from "../../application/use-cases/update-profile.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared/utils/api-response";
import { updateProfileSchema } from "../schemas/profile.schema";

export class UpdateProfileController {
    constructor(private readonly updateProfile: UpdateProfile) { }

    execute = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new UnauthorizedError("Unauthorized");
            }

            const validatedData = updateProfileSchema.parse(req.body);
            const updatedProfile = await this.updateProfile.execute(userId, validatedData);

            ApiResponse.success(res, { profile: updatedProfile }, "Profile updated successfully");
        } catch (error) {
            next(error);
        }
    };
}
