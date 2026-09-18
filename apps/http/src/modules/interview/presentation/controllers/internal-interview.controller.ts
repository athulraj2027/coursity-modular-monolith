import { Request, Response, NextFunction } from "express";
import { InternalInterviewUseCases } from "../../application/use-cases/internal-interview.usecases";
import {
  InternalAbandonSessionSchema,
  InternalAppendTranscriptSchema,
  InternalEndSessionSchema,
  InternalInitializeSessionSchema,
  InternalStartSessionSchema,
  InternalUpdateMetadataSchema,
} from "../validators/interview.validator";

export class InternalInterviewController {
  constructor(private readonly useCases: InternalInterviewUseCases) {}

  private getIdParam(param: string | string[] | undefined): string {
    if (Array.isArray(param)) return param[0];
    return (param as string) || "";
  }

  // 1. POST /internal/interviews/sessions/:id/initialize
  initializeSession = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getIdParam(req.params.id);
      const validated = InternalInitializeSessionSchema.parse(req.body);

      const session = await this.useCases.initializeSession({
        sessionId: id,
        livekitRoomSid: validated.livekitRoomSid,
        meta: validated.meta,
      });

      res.status(200).json({
        success: true,
        message: "Interview session initialized by AI engine",
        data: session,
      });
    } catch (error) {
      next(error);
    }
  };

  // 2. POST /internal/interviews/sessions/:id/start
  startSession = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getIdParam(req.params.id);
      const validated = InternalStartSessionSchema.parse(req.body);

      const session = await this.useCases.startSession({
        sessionId: id,
        startedAt: validated.startedAt ? new Date(validated.startedAt) : undefined,
        meta: validated.meta,
      });

      res.status(200).json({
        success: true,
        message: "Interview session started by AI engine",
        data: session,
      });
    } catch (error) {
      next(error);
    }
  };

  // 3. POST /internal/interviews/sessions/:id/end
  endSession = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getIdParam(req.params.id);
      const validated = InternalEndSessionSchema.parse(req.body);

      const session = await this.useCases.endSession({
        sessionId: id,
        endedAt: validated.endedAt ? new Date(validated.endedAt) : undefined,
        durationSeconds: validated.durationSeconds,
        overallScore: validated.overallScore,
        outcome: validated.outcome,
        summaryFeedback: validated.summaryFeedback,
        strengths: validated.strengths,
        improvements: validated.improvements,
        recordingUrl: validated.recordingUrl,
        criteriaScores: validated.criteriaScores,
        meta: validated.meta,
      });

      res.status(200).json({
        success: true,
        message: "Interview evaluation processed and finalized",
        data: session,
      });
    } catch (error) {
      next(error);
    }
  };

  // 4. POST /internal/interviews/sessions/:id/transcripts
  appendTranscript = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getIdParam(req.params.id);
      const validated = InternalAppendTranscriptSchema.parse(req.body);

      const transcript = await this.useCases.appendTranscript({
        sessionId: id,
        role: validated.role,
        content: validated.content,
        audioUrl: validated.audioUrl,
        sequenceOrder: validated.sequenceOrder,
        durationMs: validated.durationMs,
        sentiment: validated.sentiment,
        turnFeedback: validated.turnFeedback,
      });

      res.status(201).json({
        success: true,
        message: "Speech turn transcript appended",
        data: transcript,
      });
    } catch (error) {
      next(error);
    }
  };

  // 5. PATCH /internal/interviews/sessions/:id/metadata
  updateMetadata = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getIdParam(req.params.id);
      const validated = InternalUpdateMetadataSchema.parse(req.body);

      const session = await this.useCases.updateMetadata({
        sessionId: id,
        livekitRoomSid: validated.livekitRoomSid,
        recordingUrl: validated.recordingUrl,
        meta: validated.meta,
      });

      res.status(200).json({
        success: true,
        message: "Session metadata updated",
        data: session,
      });
    } catch (error) {
      next(error);
    }
  };

  // 6. POST /internal/interviews/sessions/:id/abandon
  abandonSession = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getIdParam(req.params.id);
      const validated = InternalAbandonSessionSchema.parse(req.body);

      const session = await this.useCases.abandonSession({
        sessionId: id,
        reason: validated.reason,
      });

      res.status(200).json({
        success: true,
        message: "Session marked as abandoned",
        data: session,
      });
    } catch (error) {
      next(error);
    }
  };
}
