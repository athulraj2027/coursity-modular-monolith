import { NextFunction, Request, Response } from "express";
import { STATUS_CODES } from "@/app/config/status";
import { BadRequestError, ConflictError, UnprocessableEntityError } from "@/app/errors";
import { IdempotencyService, idempotencyService as defaultService } from "@/infrastructure/idempotency/idempotency.service";
import { IdempotencyOptions } from "@/infrastructure/idempotency/idempotency.types";

export const createIdempotencyMiddleware = (
    service: IdempotencyService = defaultService,
    options: IdempotencyOptions = {}
) => {
    const {
        ttlSeconds = 86400, // 24 hours
        required = false,
        lockTimeoutSeconds = 30,
    } = options;

    return async (req: Request, res: Response, next: NextFunction) => {
        if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") return next();

        const rawKey = req.headers["idempotency-key"] || req.headers["x-idempotency-key"];

        if (!rawKey) {
            if (required)
                return next(new BadRequestError("Idempotency-Key header is required for this operation."));
            return next();
        }

        const key = (Array.isArray(rawKey) ? rawKey[0] : rawKey).trim();

        if (!key || key.length > 255)
            return next(new BadRequestError("Invalid Idempotency-Key header format."));

        try {
            const requestPath = req.originalUrl || req.baseUrl + req.path;
            const fingerprint = service.generateRequestFingerprint(
                req.method,
                requestPath,
                req.body,
                req.user?.userId
            );

            const lockResult = await service.acquireLock({
                key,
                method: req.method,
                path: requestPath,
                requestHash: fingerprint,
                userId: req.user?.userId,
                ttlSeconds,
                lockTimeoutSeconds,
            });

            if (lockResult.mismatch) {
                throw new UnprocessableEntityError(
                    "Idempotency key was previously used with a different request payload or endpoint."
                );
            }

            if (!lockResult.acquired) {
                const existing = lockResult.existingRecord;

                if (existing?.status === "COMPLETED") {
                    res.setHeader("Idempotent-Replayed", "true");
                    res.setHeader("X-Cache", "IDEMPOTENT-HIT");
                    return res.status(existing.statusCode || STATUS_CODES.OK).json(existing.responseBody);
                }

                if (existing?.status === "PROCESSING") {
                    res.setHeader("Retry-After", "2");
                    throw new ConflictError(
                        "A request with this idempotency key is currently in progress. Please retry shortly."
                    );
                }
            }

            const originalJson = res.json.bind(res);
            let responseCaptured = false;

            res.json = function (body: any) {
                if (!responseCaptured) {
                    responseCaptured = true;
                    const statusCode = res.statusCode || STATUS_CODES.OK;

                    if (statusCode >= 200 && statusCode < 500) {
                        service.saveCompletedResponse({
                            key,
                            statusCode,
                            responseBody: body,
                            ttlSeconds,
                        }).catch((err) => {
                            console.error(`❌ [Idempotency] Failed to save response for ${key}:`, err);
                        });
                    } else
                        service.markFailed(key).catch(() => { });
                }
                return originalJson(body);
            };

            next();
        } catch (error) {
            next(error);
        }
    };
};

export const idempotencyMiddleware = createIdempotencyMiddleware();
export default idempotencyMiddleware;
