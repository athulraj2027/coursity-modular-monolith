import { NextFunction, Request, Response } from "express";
import { SigninUser } from "../../application/use-cases/signin.user.usecase";
import { setAuthCookies } from "@/app/config/cookie";
import { ApiResponse } from "@/shared/utils/api-response";

export class SigninController {
    constructor(private readonly signinUser: SigninUser) { }

    execute = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password, role } = req.body;
            const result = await this.signinUser.execute({ email, password, role });

            // Set HTTP-only auth cookies
            setAuthCookies(res, {
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
            });

            return ApiResponse.success(res, result, "Signed in successfully");
        } catch (error) {
            next(error);
        }
    };
}

