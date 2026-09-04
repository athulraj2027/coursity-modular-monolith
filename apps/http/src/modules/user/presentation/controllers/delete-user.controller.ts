import { NextFunction, Request, Response } from "express";
import { DeleteUser } from "../../application/use-cases/delete-user.usecase";
import { STATUS_CODES } from "@/app/config/status";

export class DeleteUserController {
    constructor(private readonly deleteUser: DeleteUser) { }

    execute = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
            const result = await this.deleteUser.execute(id);

            res.status(STATUS_CODES.OK).json({
                message: result.message,
            });
        } catch (error) {
            next(error);
        }
    };
}
