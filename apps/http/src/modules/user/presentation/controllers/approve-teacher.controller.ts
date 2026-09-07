import { NextFunction, Request, Response } from "express";
import { ApproveTeacher } from "../../application/use-cases/approve-teacher.usecase";
import { STATUS_CODES } from "@/app/config/status";

export class ApproveTeacherController {
    constructor(private readonly approveTeacher: ApproveTeacher) { }

    execute = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
            const isApproved = req.body?.isApproved !== undefined ? Boolean(req.body.isApproved) : true;

            const result = await this.approveTeacher.execute(id, isApproved);

            res.status(STATUS_CODES.OK).json({
                message: result.message,
                data: {
                    user: result.user,
                },
            });
        } catch (error) {
            next(error);
        }
    };
}
