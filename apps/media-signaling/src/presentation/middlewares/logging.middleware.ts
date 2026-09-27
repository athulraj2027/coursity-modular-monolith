import { Request, Response, NextFunction } from "express";
import { logger } from "@/shared/logger/Logger";

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const msg = `${req.method} ${req.originalUrl} - ${status} (${duration}ms)`;

    if (status >= 500) {
      logger.error(msg);
    } else if (status >= 400) {
      logger.warn(msg);
    } else {
      logger.debug(msg);
    }
  });

  next();
};
