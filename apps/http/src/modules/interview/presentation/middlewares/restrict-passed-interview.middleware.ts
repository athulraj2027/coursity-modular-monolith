import { Request, Response, NextFunction } from "express";
import defaultPrisma from "@/infrastructure/database/prisma.client";
import { InterviewAlreadyPassedError } from "../../domain/errors/interview.error";

/**
 * Middleware to restrict candidates who have already passed an AI interview
 * from initiating or starting new AI interview sessions.
 */
export async function restrictPassedInterviewMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next();
    }

    // 1. Check if TeacherProfile is already marked as passed
    const teacherProfile = await (defaultPrisma as any).teacherProfile.findFirst({
      where: {
        profile: {
          userId,
        },
      },
      select: {
        isInterviewPassed: true,
      },
    });

    if (teacherProfile?.isInterviewPassed) {
      throw new InterviewAlreadyPassedError(
        "You have already passed the AI interview assessment. Starting a new interview is not permitted."
      );
    }

    // 2. Check if there is an existing session with outcome PASSED
    const passedSession = await (defaultPrisma as any).interviewSession.findFirst({
      where: {
        userId,
        outcome: "PASSED",
      },
      select: {
        id: true,
      },
    });

    if (passedSession) {
      throw new InterviewAlreadyPassedError(
        "You have already passed the AI interview assessment. Starting a new interview is not permitted."
      );
    }

    return next();
  } catch (error) {
    return next(error);
  }
}

export default restrictPassedInterviewMiddleware;
