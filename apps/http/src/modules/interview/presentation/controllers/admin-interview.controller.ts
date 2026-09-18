import { Request, Response, NextFunction } from "express";
import { AdminInterviewUseCases } from "../../application/use-cases/admin-interview.usecases";
import {
  AdminAdjustEvaluationSchema,
  AdminListSessionsQuerySchema,
  AdminListTemplatesQuerySchema,
  AdminOverrideDecisionSchema,
  CreateInterviewTemplateSchema,
  ToggleTemplateStatusSchema,
  UpdateInterviewTemplateSchema,
} from "../validators/interview.validator";

export class AdminInterviewController {
  constructor(private readonly useCases: AdminInterviewUseCases) {}

  // Helper to safely extract single string param
  private getIdParam(param: string | string[] | undefined): string {
    if (Array.isArray(param)) return param[0];
    return (param as string) || "";
  }

  private getUserId(req: Request): string {
    const user = (req as any).user;
    return user?.userId || user?.id || (req as any).userId || "";
  }

  // ==========================================
  // SESSIONS MANAGEMENT (7 endpoints)
  // ==========================================

  // 1. GET /api/admin/interviews/sessions
  getSessions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query = AdminListSessionsQuerySchema.parse(req.query);
      const result = await this.useCases.getSessions(query);

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

  // 2. GET /api/admin/interviews/sessions/:id
  getSessionById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getIdParam(req.params.id);
      const session = await this.useCases.getSessionDetails(id);
      res.status(200).json({ success: true, data: session });
    } catch (error) {
      next(error);
    }
  };

  // 3. GET /api/admin/interviews/sessions/:id/transcripts
  getSessionTranscripts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getIdParam(req.params.id);
      const transcripts = await this.useCases.getSessionTranscripts(id);
      res.status(200).json({ success: true, data: transcripts });
    } catch (error) {
      next(error);
    }
  };

  // 4. GET /api/admin/interviews/sessions/:id/recording
  getSessionRecording = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getIdParam(req.params.id);
      const recordingData = await this.useCases.getSessionRecording(id);
      res.status(200).json({ success: true, data: recordingData });
    } catch (error) {
      next(error);
    }
  };

  // 5. PATCH /api/admin/interviews/sessions/:id/decision
  overrideDecision = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getIdParam(req.params.id);
      const adminId = this.getUserId(req);
      const validated = AdminOverrideDecisionSchema.parse(req.body);

      const session = await this.useCases.overrideDecision({
        sessionId: id,
        adminId,
        outcome: validated.outcome,
        overallScore: validated.overallScore,
        adminNote: validated.adminNote,
      });

      res.status(200).json({
        success: true,
        message: "Interview decision overridden successfully",
        data: session,
      });
    } catch (error) {
      next(error);
    }
  };

  // 6. PATCH /api/admin/interviews/sessions/:id/evaluation
  adjustEvaluation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getIdParam(req.params.id);
      const adminId = this.getUserId(req);
      const validated = AdminAdjustEvaluationSchema.parse(req.body);

      const session = await this.useCases.adjustEvaluation({
        sessionId: id,
        adminId,
        overallScore: validated.overallScore,
        summaryFeedback: validated.summaryFeedback,
        strengths: validated.strengths,
        improvements: validated.improvements,
        criteriaScores: validated.criteriaScores,
        adminNote: validated.adminNote,
      });

      res.status(200).json({
        success: true,
        message: "Interview evaluation adjusted successfully",
        data: session,
      });
    } catch (error) {
      next(error);
    }
  };

  // 7. GET /api/admin/interviews/sessions/:id/audit
  getSessionAudit = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getIdParam(req.params.id);
      const auditLogs = await this.useCases.getSessionAudit(id);
      res.status(200).json({ success: true, data: auditLogs });
    } catch (error) {
      next(error);
    }
  };

  // ==========================================
  // TEMPLATES MANAGEMENT (6 endpoints)
  // ==========================================

  // 8. POST /api/admin/interviews/templates
  createTemplate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const adminId = (req as any).user?.id || (req as any).userId;
      const validated = CreateInterviewTemplateSchema.parse(req.body);

      const template = await this.useCases.createTemplate({
        ...validated,
        adminId,
      });

      res.status(201).json({
        success: true,
        message: "Interview template created successfully",
        data: template,
      });
    } catch (error) {
      next(error);
    }
  };

  // 9. GET /api/admin/interviews/templates
  getTemplates = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query = AdminListTemplatesQuerySchema.parse(req.query);
      const result = await this.useCases.getTemplates(query);

      res.status(200).json({
        success: true,
        data: result.templates,
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

  // 10. GET /api/admin/interviews/templates/:id
  getTemplateById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getIdParam(req.params.id);
      const template = await this.useCases.getTemplateById(id);
      res.status(200).json({ success: true, data: template });
    } catch (error) {
      next(error);
    }
  };

  // 11. PATCH /api/admin/interviews/templates/:id
  updateTemplate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getIdParam(req.params.id);
      const adminId = (req as any).user?.id || (req as any).userId;
      const validated = UpdateInterviewTemplateSchema.parse(req.body);

      const template = await this.useCases.updateTemplate(id, {
        ...validated,
        adminId,
      });

      res.status(200).json({
        success: true,
        message: "Interview template updated successfully",
        data: template,
      });
    } catch (error) {
      next(error);
    }
  };

  // 12. PATCH /api/admin/interviews/templates/:id/status
  toggleTemplateStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getIdParam(req.params.id);
      const validated = ToggleTemplateStatusSchema.parse(req.body);

      const template = await this.useCases.toggleTemplateStatus(
        id,
        validated.isActive
      );

      res.status(200).json({
        success: true,
        message: `Template ${validated.isActive ? "activated" : "deactivated"} successfully`,
        data: template,
      });
    } catch (error) {
      next(error);
    }
  };

  // 13. GET /api/admin/interviews/templates/:id/versions
  getTemplateVersions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getIdParam(req.params.id);
      const versions = await this.useCases.getTemplateVersions(id);
      res.status(200).json({ success: true, data: versions });
    } catch (error) {
      next(error);
    }
  };

  // ==========================================
  // ANALYTICS MANAGEMENT (3 endpoints)
  // ==========================================

  // 14. GET /api/admin/interviews/analytics/overview
  getAnalyticsOverview = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { startDate, endDate } = req.query as {
        startDate?: string;
        endDate?: string;
      };
      const overview = await this.useCases.getAnalyticsOverview(
        startDate,
        endDate
      );
      res.status(200).json({ success: true, data: overview });
    } catch (error) {
      next(error);
    }
  };

  // 15. GET /api/admin/interviews/analytics/timeseries
  getAnalyticsTimeseries = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const days = req.query.days ? Number(req.query.days) : 30;
      const timeseries = await this.useCases.getAnalyticsTimeseries(days);
      res.status(200).json({ success: true, data: timeseries });
    } catch (error) {
      next(error);
    }
  };

  // 16. GET /api/admin/interviews/analytics/templates/:templateId
  getTemplateAnalytics = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const templateId = this.getIdParam(req.params.templateId);
      const analytics = await this.useCases.getTemplateAnalytics(templateId);
      res.status(200).json({ success: true, data: analytics });
    } catch (error) {
      next(error);
    }
  };
}
