import { NextFunction, Request, Response } from "express";
import { UpdateUserRole } from "../../application/use-cases/update-user-role.usecase";
import { STATUS_CODES } from "@/app/config/status";

export class UpdateUserRoleController {
    constructor(private readonly updateUserRole: UpdateUserRole) { }

    execute = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
            const { role } = req.body;

            const updatedUser = await this.updateUserRole.execute(id, role);

            res.status(STATUS_CODES.OK).json({
                message: "User role updated successfully",
                data: { user: updatedUser },
            });
        } catch (error) {
            next(error);
        }
    };
}
