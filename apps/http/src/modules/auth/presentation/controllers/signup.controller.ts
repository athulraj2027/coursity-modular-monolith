import { NextFunction, Request, Response } from "express";
import { SignupUser } from "../../application/use-cases/signup.user.usecase";
import { STATUS_CODES } from "@/app/config/status";

export class SignupController {
    constructor(
        private readonly signupUser: SignupUser
    ) { }

    execute = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { name, email, password, role } = req.body;

            const user = await this.signupUser.execute({ name, email, password, role })
            res.status(STATUS_CODES.CREATED).json({
                message: "Signup successful",
                data: user,
            });
        } catch (error) {
            next(error);
        }
    }
}
