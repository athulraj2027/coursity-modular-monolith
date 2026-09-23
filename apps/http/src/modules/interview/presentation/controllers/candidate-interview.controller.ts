import { Request, Response, NextFunction } from "express";
import { CandidateInterviewUseCases } from "../../application/use-cases/candidate-interview.usecases";
import {
  CandidateListSessionsQuerySchema,
  CreateInterviewSessionSchema,
} from "../validators/interview.validator";
import { UnauthorizedError } from "@/app/errors";

export class CandidateInterviewController {
  constructor(private readonly useCases: CandidateInterviewUseCases) {}

  private getIdParam(param: string | string[] | undefined): string {
    if (Array.isArray(param)) return param[0];
    return (param as string) || "";
  }

  private getUserId(req: Request): string {
    const user = (req as any).user;
    const userId = user?.userId || user?.id || (req as any).userId;
    if (!userId) {
      throw new UnauthorizedError("Authentication required. Please sign in.");
    }
    return userId;
  }

  private getUserRole(req: Request): string {
    const user = (req as any).user;
    return user?.role || "STUDENT";
  }

  private getUserName(req: Request): string {
    const user = (req as any).user;
    return user?.name || user?.email || "Candidate";
  }

  // 1. GET /api/interviews/templates
  getTemplates = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { domain, difficulty, type } = req.query as {
        domain?: string;
        difficulty?: string;
        type?: string;
      };
      const templates = await this.useCases.getActiveTemplates({
        domain,
        difficulty,
        type,
      });
      res.status(200).json({ success: true, data: templates });
    } catch (error) {
      next(error);
    }
  };

  // 2. GET /api/interviews/templates/:slug
  getTemplateBySlug = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const slug = this.getIdParam(req.params.slug);
      const template = await this.useCases.getTemplateBySlug(slug);
      res.status(200).json({ success: true, data: template });
    } catch (error) {
      next(error);
    }
  };

  // 3. POST /api/interviews/sessions
  createSession = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validated = CreateInterviewSessionSchema.parse(req.body);
      const userId = this.getUserId(req);
      const userRole = this.getUserRole(req);

      const session = await this.useCases.createSession({
        userId,
        userRole,
        templateId: validated.templateId,
        type: validated.type,
        domain: validated.domain,
        difficulty: validated.difficulty,
      });

      res.status(201).json({
        success: true,
        message: "Interview session created successfully",
        data: session,
      });
    } catch (error) {
      next(error);
    }
  };

  // 4. GET /api/interviews/sessions/:id
  getSession = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getIdParam(req.params.id);
      const userId = this.getUserId(req);
      const userRole = this.getUserRole(req);

      const session = await this.useCases.getSession(id, userId, userRole);
      res.status(200).json({ success: true, data: session });
    } catch (error) {
      next(error);
    }
  };

  // 5. POST /api/interviews/sessions/:id/start
  startSession = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getIdParam(req.params.id);
      const userId = this.getUserId(req);

      const session = await this.useCases.startSession(id, userId);
      res.status(200).json({
        success: true,
        message: "Interview session started",
        data: session,
      });
    } catch (error) {
      next(error);
    }
  };

  // 6. POST /api/interviews/sessions/:id/realtime-token
  getRealtimeToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getIdParam(req.params.id);
      const userId = this.getUserId(req);
      const userName = this.getUserName(req);

      const tokenData = await this.useCases.generateRealtimeToken(
        id,
        userId,
        userName
      );

      res.status(200).json({ success: true, data: tokenData });
    } catch (error) {
      next(error);
    }
  };

  // 7. GET /api/interviews/sessions/:id/transcripts
  getTranscripts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getIdParam(req.params.id);
      const userId = this.getUserId(req);
      const userRole = this.getUserRole(req);

      const transcripts = await this.useCases.getTranscripts(
        id,
        userId,
        userRole
      );
      res.status(200).json({ success: true, data: transcripts });
    } catch (error) {
      next(error);
    }
  };

  // 8. GET /api/interviews/sessions/:id/transcripts/latest
  getLatestTranscripts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getIdParam(req.params.id);
      const limit = req.query.limit ? Number(req.query.limit) : 5;
      const userId = this.getUserId(req);

      const transcripts = await this.useCases.getLatestTranscripts(
        id,
        userId,
        limit
      );
      res.status(200).json({ success: true, data: transcripts });
    } catch (error) {
      next(error);
    }
  };

  // 9. POST /api/interviews/sessions/:id/complete
  completeSession = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getIdParam(req.params.id);
      const userId = this.getUserId(req);

      const session = await this.useCases.completeSession(id, userId);
      res.status(200).json({
        success: true,
        message: "Interview submitted for evaluation",
        data: session,
      });
    } catch (error) {
      next(error);
    }
  };

  // 10. POST /api/interviews/sessions/:id/cancel
  cancelSession = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getIdParam(req.params.id);
      const { reason } = req.body || {};
      const userId = this.getUserId(req);

      const session = await this.useCases.cancelSession(id, userId, reason);
      res.status(200).json({
        success: true,
        message: "Interview session cancelled",
        data: session,
      });
    } catch (error) {
      next(error);
    }
  };

  // 11. GET /api/interviews/sessions/:id/report
  getReport = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getIdParam(req.params.id);
      const userId = this.getUserId(req);
      const userRole = this.getUserRole(req);

      const session = await this.useCases.getReport(id, userId, userRole);
      res.status(200).json({
        success: true,
        data: {
          sessionId: session.id,
          type: session.type,
          status: session.status,
          difficulty: session.difficulty,
          domain: session.domain,
          overallScore: session.overallScore,
          outcome: session.outcome,
          summaryFeedback: session.summaryFeedback,
          strengths: session.strengths,
          improvements: session.improvements,
          criteriaScores: session.criteriaScores,
          durationSeconds: session.durationSeconds,
          startedAt: session.startedAt,
          endedAt: session.endedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // 12. GET /api/interviews/sessions/:id/recording
  getRecording = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getIdParam(req.params.id);
      const userId = this.getUserId(req);
      const userRole = this.getUserRole(req);

      const recordingData = await this.useCases.getRecordingUrl(
        id,
        userId,
        userRole
      );
      res.status(200).json({ success: true, data: recordingData });
    } catch (error) {
      next(error);
    }
  };

  // 13. GET /api/interviews/my-interviews
  getMyInterviews = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = this.getUserId(req);
      const query = CandidateListSessionsQuerySchema.parse(req.query);

      const result = await this.useCases.getMyInterviews({
        userId,
        ...query,
      });

      res.status(200).json({
        success: true,
        data: result.sessions,
        meta: {
          total: result.total,
          page: query.page,
          limit: query.limit,
          totalPages: Math.ceil(result.total / query.limit),
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
