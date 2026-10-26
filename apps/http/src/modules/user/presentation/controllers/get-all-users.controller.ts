import { NextFunction, Request, Response } from "express";
import { GetAllUsers } from "../../application/use-cases/get-all-users.usecase";
import { getUsersQuerySchema } from "../validators/user.validator";
import { ApiResponse } from "@/shared/utils/api-response";

export class GetAllUsersController {
    constructor(private readonly getAllUsers: GetAllUsers) { }

    execute = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const query = getUsersQuerySchema.parse(req.query);
            const result = await this.getAllUsers.execute(query);

            return ApiResponse.success(res, result, "Users fetched successfully");
        } catch (error) {
            next(error);
        }
    };
}
