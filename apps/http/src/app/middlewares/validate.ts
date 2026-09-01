import { STATUS_CODES } from "@/app/config/status";
import { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";

export default function validate(schema: z.ZodSchema) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.body || typeof req.body !== "object") {
                return res.status(STATUS_CODES.BAD_REQUEST).json({
                    message: "Validation error",
                    errors: [{ field: "body", message: "Request body is required and must be JSON" }],
                });
            }

            const parsed = await schema.parseAsync(req.body);
            req.body = parsed;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.issues.map((issue) => ({
                    field: issue.path.join(".") || "root",
                    message: issue.message,
                }));

                return res.status(STATUS_CODES.BAD_REQUEST).json({
                    message: "Validation error",
                    errors,
                });
            }
            next(error);
        }
    };
}
