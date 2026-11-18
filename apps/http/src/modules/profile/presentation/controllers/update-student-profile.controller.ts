import { NextFunction, Request, Response } from "express";
import { UpdateStudentProfile } from "../../application/use-cases/update-student-profile.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared/utils/api-response";
import { updateStudentProfileSchema } from "../schemas/profile.schema";

export class UpdateStudentProfileController {
    constructor(private readonly updateStudentProfile: UpdateStudentProfile) { }

    execute = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new UnauthorizedError("Unauthorized");
            }

            const validatedData = updateStudentProfileSchema.parse(req.body);
            const updatedProfile = await this.updateStudentProfile.execute(userId, validatedData);

            ApiResponse.success(res, { profile: updatedProfile }, "Student profile updated successfully");
        } catch (error) {
            next(error);
        }
    };
}
