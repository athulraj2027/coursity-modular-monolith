import { NextFunction, Request, Response } from "express";
import { SubmitTeacherVerification } from "../../application/use-cases/submit-teacher-verification.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared/utils/api-response";

export class SubmitTeacherVerificationController {
    constructor(private readonly submitTeacherVerification: SubmitTeacherVerification) { }

    execute = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new UnauthorizedError("Unauthorized");
            }

            const result = await this.submitTeacherVerification.execute(userId);

            return ApiResponse.success(res, { profile: result.profile }, result.message);
        } catch (error) {
            next(error);
        }
    };
}
