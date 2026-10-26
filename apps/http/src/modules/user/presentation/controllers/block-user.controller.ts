import { NextFunction, Request, Response } from "express";
import { BlockUser } from "../../application/use-cases/block-user.usecase";
import { ApiResponse } from "@/shared/utils/api-response";

export class BlockUserController {
    constructor(private readonly blockUser: BlockUser) { }

    execute = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
            const isBlocked = typeof req.body?.isBlocked === "boolean" ? req.body.isBlocked : undefined;

            const result = await this.blockUser.execute(id, isBlocked);

            return ApiResponse.success(res, { user: result.user }, result.message);
        } catch (error) {
            next(error);
        }
    };
}
