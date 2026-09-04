import { NextFunction, Request, Response } from "express";
import { GetUserById } from "../../application/use-cases/get-user-by-id.usecase";
import { STATUS_CODES } from "@/app/config/status";

export class GetUserByIdController {
    constructor(private readonly getUserById: GetUserById) { }

    execute = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
            const user = await this.getUserById.execute(id);

            res.status(STATUS_CODES.OK).json({
                message: "User fetched successfully",
                data: { user },
            });
        } catch (error) {
            next(error);
        }
    };
}
