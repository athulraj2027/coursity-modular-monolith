import { STATUS_CODES } from "@/app/config/status";
import { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";

export default function validate(schema: z.ZodObject<any>) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const parsed = await schema.parseAsync(req.body);
            req.body = parsed;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.issues.map((error) => error.message);
                return res.status(STATUS_CODES.BAD_REQUEST).json({
                    message: "Validation error",
                    errors,
                });
            }
            next(error);
        }
    }
}