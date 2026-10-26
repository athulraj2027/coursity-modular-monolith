import { NextFunction, Request, Response } from "express";
import { GetUserById } from "../../application/use-cases/get-user-by-id.usecase";
import { ApiResponse } from "@/shared/utils/api-response";

export class GetUserByIdController {
    constructor(private readonly getUserById: GetUserById) { }

    execute = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
            const user = await this.getUserById.execute(id);

            return ApiResponse.success(res, { user }, "User fetched successfully");
        } catch (error) {
            next(error);
        }
    };
}
