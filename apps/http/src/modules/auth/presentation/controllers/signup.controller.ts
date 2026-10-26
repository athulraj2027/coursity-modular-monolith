import { NextFunction, Request, Response } from "express";
import { SignupUser } from "../../application/use-cases/signup.user.usecase";
import { ApiResponse } from "@/shared/utils/api-response";

export class SignupController {
    constructor(
        private readonly signupUser: SignupUser
    ) { }

    execute = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { name, email, password, role } = req.body;

            const user = await this.signupUser.execute({ name, email, password, role });
            return ApiResponse.created(res, user, "Signup successful");
        } catch (error) {
            next(error);
        }
    }
}
