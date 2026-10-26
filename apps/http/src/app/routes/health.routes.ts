import { Router, Request, Response } from "express";
import { ApiResponse } from "@/shared";

const healthRouter = Router();

const getHealthStatus = (_req: Request, res: Response): void => {
    ApiResponse.success(res, {
        status: "ok",
        uptime: process.uptime(),
    });
};

healthRouter.get("/", getHealthStatus);
healthRouter.get("/health", getHealthStatus);

export { healthRouter };
export default healthRouter;
