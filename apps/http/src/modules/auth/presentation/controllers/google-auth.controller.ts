import { NextFunction, Request, Response } from "express";
import { GoogleAuth } from "../../application/use-cases/google-auth.usecase";
import { STATUS_CODES } from "@/app/config/status";
import { env } from "@/app/config/env";
import { UserRole } from "@/modules/user";
import { setAuthCookies } from "@/app/config/cookie";

export class GoogleAuthController {
    constructor(private readonly googleAuth: GoogleAuth) { }

    getAuthUrl = async (req: Request, res: Response, next: NextFunction) => {
        try {
            let state = typeof req.query.state === "string" ? req.query.state : undefined;
            if (!state && typeof req.query.role === "string") {
                state = JSON.stringify({ role: req.query.role.toUpperCase() });
            }

            const result = this.googleAuth.getAuthUrl(state);

            // If query has redirect=true, redirect directly to Google consent screen
            if (req.query.redirect === "true") {
                return res.redirect(result.url);
            }

            res.status(STATUS_CODES.OK).json({
                message: "Google OAuth URL generated",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    execute = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { idToken, credential, code, role } = req.body;
            const result = await this.googleAuth.execute({
                idToken,
                credential,
                code,
                role: role as UserRole,
            });

            // Set HTTP-only auth cookies
            setAuthCookies(res, {
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
            });

            res.status(STATUS_CODES.OK).json({
                message: "Google authentication successful",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    callback = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const code = (req.body?.code || req.query?.code) as string;
            let role = (req.body?.role || req.query?.role) as UserRole | undefined;

            // Extract role from state if available
            const state = (req.body?.state || req.query?.state) as string | undefined;
            if (!role && state) {
                try {
                    const parsedState = JSON.parse(state);
                    if (parsedState.role) role = parsedState.role as UserRole;
                } catch {
                    if (state.toUpperCase() === "TEACHER" || state.toUpperCase() === "STUDENT" || state.toUpperCase() === "ADMIN") {
                        role = state.toUpperCase() as UserRole;
                    }
                }
            }

            const result = await this.googleAuth.handleCallback(code, role);

            // Set HTTP-only auth cookies
            setAuthCookies(res, {
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
            });

            // If GET request from browser redirect, redirect to frontend
            if (req.method === "GET" && env.FRONTEND_URL) {
                const redirectUrl = new URL(`${env.FRONTEND_URL}/auth/callback`);
                return res.redirect(redirectUrl.toString());
            }

            res.status(STATUS_CODES.OK).json({
                message: "Google OAuth callback handled successfully",
                data: result,
            });
        } catch (error: any) {
            // If browser GET redirect failed, redirect back to frontend signin with error parameter
            if (req.method === "GET" && env.FRONTEND_URL) {
                const errorMessage = error?.message || "Google authentication failed";
                const redirectUrl = new URL(`${env.FRONTEND_URL}/signin`);
                redirectUrl.searchParams.set("error", errorMessage);
                return res.redirect(redirectUrl.toString());
            }
            next(error);
        }
    };
}
