import { NextFunction, Request, Response } from "express";
import { UpdateTeacherProfile } from "../../application/use-cases/update-teacher-profile.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared/utils/api-response";

export class UpdateTeacherProfileController {
    constructor(private readonly updateTeacherProfile: UpdateTeacherProfile) { }

    execute = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new UnauthorizedError("Unauthorized");
            }

            const updatedProfile = await this.updateTeacherProfile.execute(userId, req.body);

            return ApiResponse.success(res, { profile: updatedProfile }, "Teacher profile updated successfully");
        } catch (error) {
            next(error);
        }
    };
}
