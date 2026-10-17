import { Router, Request, Response } from "express";

const healthRouter = Router();

const getHealthStatus = (_req: Request, res: Response): void => {
    res.status(200).json({
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
};

healthRouter.get("/", getHealthStatus);
healthRouter.get("/health", getHealthStatus);

export { healthRouter };
export default healthRouter;
