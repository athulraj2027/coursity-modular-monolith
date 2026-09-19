import { Request, Response, NextFunction } from "express";
import defaultPrisma from "@/infrastructure/database/prisma.client";
import {
  InterviewAlreadyPassedError,
  MaxInterviewAttemptsReachedError,
} from "../../domain/errors/interview.error";

/**
 * Middleware to restrict candidates who have already passed an AI interview
 * or who have reached the maximum retry attempts (3) from initiating new sessions.
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

    // 1. Check if TeacherProfile is already marked as passed or reached max attempts
    const teacherProfile = await (defaultPrisma as any).teacherProfile.findFirst({
      where: {
        profile: {
          userId,
        },
      },
      select: {
        isInterviewPassed: true,
        interviewAttempts: true,
      },
    });

    if (teacherProfile?.isInterviewPassed) {
      throw new InterviewAlreadyPassedError(
        "You have already passed the AI interview assessment. Starting a new interview is not permitted."
      );
    }

    if (teacherProfile && (teacherProfile.interviewAttempts ?? 0) >= 3) {
      throw new MaxInterviewAttemptsReachedError(
        "Maximum interview attempts (3 of 3) reached. Starting a new interview is not permitted. Please contact admissions support."
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

    // 3. Check completed or active sessions count for teacher vetting
    const totalVettingSessions = await (defaultPrisma as any).interviewSession.count({
      where: {
        userId,
        type: "TEACHER_VETTING",
        status: {
          in: ["COMPLETED", "IN_PROGRESS", "INITIALIZING"],
        },
      },
    });

    if (totalVettingSessions >= 3) {
      throw new MaxInterviewAttemptsReachedError(
        "Maximum interview attempts (3 of 3) reached. Starting a new interview is not permitted. Please contact admissions support."
      );
    }

    return next();
  } catch (error) {
    return next(error);
  }
}

export default restrictPassedInterviewMiddleware;

