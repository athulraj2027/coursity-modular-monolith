import { NextFunction, Request, Response } from "express";
import { UpdateStudentProfile } from "../../application/use-cases/update-student-profile.usecase";
import { STATUS_CODES } from "@/app/config/status";
import { UnauthorizedError } from "@/app/errors";

export class UpdateStudentProfileController {
    constructor(private readonly updateStudentProfile: UpdateStudentProfile) { }

    execute = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new UnauthorizedError("Unauthorized");
            }

            const updatedProfile = await this.updateStudentProfile.execute(userId, req.body);

            res.status(STATUS_CODES.OK).json({
                message: "Student profile updated successfully",
                data: { profile: updatedProfile },
            });
        } catch (error) {
            next(error);
        }
    };
}
