import { NextFunction, Request, Response } from "express";
import { UpdateTeacherProfile } from "../../application/use-cases/update-teacher-profile.usecase";
import { STATUS_CODES } from "@/app/config/status";
import { UnauthorizedError } from "@/app/errors";

export class UpdateTeacherProfileController {
    constructor(private readonly updateTeacherProfile: UpdateTeacherProfile) { }

    execute = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new UnauthorizedError("Unauthorized");
            }

            const updatedProfile = await this.updateTeacherProfile.execute(userId, req.body);

            res.status(STATUS_CODES.OK).json({
                message: "Teacher profile updated successfully",
                data: { profile: updatedProfile },
            });
        } catch (error) {
            next(error);
        }
    };
}
