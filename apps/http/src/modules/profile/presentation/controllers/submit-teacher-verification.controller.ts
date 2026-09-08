import { NextFunction, Request, Response } from "express";
import { SubmitTeacherVerification } from "../../application/use-cases/submit-teacher-verification.usecase";
import { STATUS_CODES } from "@/app/config/status";
import { UnauthorizedError } from "@/app/errors";

export class SubmitTeacherVerificationController {
    constructor(private readonly submitTeacherVerification: SubmitTeacherVerification) { }

    execute = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new UnauthorizedError("Unauthorized");
            }

            const result = await this.submitTeacherVerification.execute(userId);

            res.status(STATUS_CODES.OK).json({
                message: result.message,
                data: { profile: result.profile },
            });
        } catch (error) {
            next(error);
        }
    };
}
