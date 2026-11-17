import { NextFunction, Request, Response } from "express";
import { UpdateTeacherProfile } from "../../application/use-cases/update-teacher-profile.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared/utils/api-response";
import { updateTeacherProfileSchema } from "../schemas/profile.schema";

export class UpdateTeacherProfileController {
    constructor(private readonly updateTeacherProfile: UpdateTeacherProfile) { }

    execute = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new UnauthorizedError("Unauthorized");
            }

            const validatedData = updateTeacherProfileSchema.parse(req.body);
            const updatedProfile = await this.updateTeacherProfile.execute(userId, validatedData);

            ApiResponse.success(res, { profile: updatedProfile }, "Teacher profile updated successfully");
        } catch (error) {
            next(error);
        }
    };
}
