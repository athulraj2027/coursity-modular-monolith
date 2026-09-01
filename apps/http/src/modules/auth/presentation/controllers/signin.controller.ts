import { NextFunction, Request, Response } from "express";
import { SigninUser } from "../../application/use-cases/signin.user.usecase";
import { STATUS_CODES } from "@/app/config/status";

export class SigninController {
    constructor(private readonly signinUser: SigninUser) { }

    execute = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password } = req.body;
            const result = await this.signinUser.execute({ email, password });

            res.status(STATUS_CODES.OK).json({
                message: "Signed in successfully",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };
}
