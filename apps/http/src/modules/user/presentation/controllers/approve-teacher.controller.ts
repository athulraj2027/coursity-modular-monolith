import { NextFunction, Request, Response } from "express";
import { ApproveTeacher } from "../../application/use-cases/approve-teacher.usecase";
import { ApiResponse } from "@/shared/utils/api-response";

export class ApproveTeacherController {
    constructor(private readonly approveTeacher: ApproveTeacher) { }

    execute = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
            const { approvalStatus, isApproved, rejectionReason } = req.body || {};

            const result = await this.approveTeacher.execute({
                userId: id,
                approvalStatus,
                isApproved,
                rejectionReason,
            });

            return ApiResponse.success(res, { user: result.user }, result.message);
        } catch (error) {
            next(error);
        }
    };
}
