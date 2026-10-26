import { Request, Response, NextFunction } from "express";
import { IInterviewSessionRepository } from "../../domain/repositories/interview-session.repository.interface";
import { PrismaInterviewSessionRepository } from "../../infrastructure/repositories/prisma-interview-session.repository";
import {
  InterviewAlreadyPassedError,
  MaxInterviewAttemptsReachedError,
} from "../../domain/errors/interview.error";

/**
 * Factory to create middleware restricting candidates who have already passed an AI interview
 * or who have reached the maximum retry attempts (3) from initiating new sessions.
 */
export function createRestrictPassedInterviewMiddleware(
  sessionRepo: IInterviewSessionRepository
) {
  return async function restrictPassedInterview(
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return next();
      }

      const check = await sessionRepo.canCandidateStartInterview(userId);
      if (!check.allowed) {
        if (check.reason === "ALREADY_PASSED") {
          throw new InterviewAlreadyPassedError(
            "You have already passed the AI interview assessment. Starting a new interview is not permitted."
          );
        }
        if (check.reason === "MAX_ATTEMPTS") {
          throw new MaxInterviewAttemptsReachedError(
            "Maximum interview attempts (3 of 3) reached. Starting a new interview is not permitted. Please contact admissions support."
          );
        }
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
}

const defaultSessionRepo = new PrismaInterviewSessionRepository();
export const restrictPassedInterviewMiddleware = createRestrictPassedInterviewMiddleware(defaultSessionRepo);
export default restrictPassedInterviewMiddleware;
