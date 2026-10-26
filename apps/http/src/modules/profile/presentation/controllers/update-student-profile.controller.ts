import { NextFunction, Request, Response } from "express";
import { UpdateStudentProfile } from "../../application/use-cases/update-student-profile.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared/utils/api-response";

export class UpdateStudentProfileController {
    constructor(private readonly updateStudentProfile: UpdateStudentProfile) { }

    execute = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new UnauthorizedError("Unauthorized");
            }

            const updatedProfile = await this.updateStudentProfile.execute(userId, req.body);

            return ApiResponse.success(res, { profile: updatedProfile }, "Student profile updated successfully");
        } catch (error) {
            next(error);
        }
    };
}
