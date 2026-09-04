import { NextFunction, Request, Response } from "express";
import { GetAllUsers } from "../../application/use-cases/get-all-users.usecase";
import { getUsersQuerySchema } from "../validators/user.validator";
import { STATUS_CODES } from "@/app/config/status";

export class GetAllUsersController {
    constructor(private readonly getAllUsers: GetAllUsers) { }

    execute = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const query = getUsersQuerySchema.parse(req.query);
            const result = await this.getAllUsers.execute(query);

            res.status(STATUS_CODES.OK).json({
                message: "Users fetched successfully",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };
}
