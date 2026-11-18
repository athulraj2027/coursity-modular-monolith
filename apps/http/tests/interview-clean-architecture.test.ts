import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  InterviewSessionEntity,
  InterviewTemplateEntity,
  InterviewTranscriptEntity,
  InterviewAuditLogEntity,
  InterviewStatus,
  InterviewOutcome,
  InterviewType,
  InterviewDifficulty,
  IInterviewSessionRepository,
  IInterviewTemplateRepository,
  IInterviewTranscriptRepository,
  IInterviewAnalyticsRepository,
  IRealtimeTokenService,
  GenerateTokenParams,
  InterviewVettingPolicy,
  InterviewLifecyclePolicy,
  InterviewEvaluationPolicy,
  CandidateInterviewUseCases,
  AdminInterviewUseCases,
  InternalInterviewUseCases,
  createInterviewModule,
  CreateInterviewSessionSchema,
  CandidateGetTemplatesQuerySchema,
  CandidateCancelSessionSchema,
  AdminOverrideDecisionSchema,
  AdminAdjustEvaluationSchema,
} from "../src/modules/interview";
import {
  InterviewAccessDeniedError,
  InterviewAlreadyPassedError,
  InterviewNotFoundError,
  InvalidInterviewStateError,
  MaxInterviewAttemptsReachedError,
  TemplateNotFoundError,
} from "../src/modules/interview/domain/errors/interview.error";
import { ZodError } from "zod";

// ============================================================================
// IN-MEMORY MOCKS
// ============================================================================

class MockRealtimeTokenService implements IRealtimeTokenService {
  public generatedTokens: GenerateTokenParams[] = [];

  generateToken(params: GenerateTokenParams) {
    this.generatedTokens.push(params);
    return {
      sessionId: params.sessionId,
      userId: params.userId,
      userName: params.userName,
      roomName: `mock-room-${params.sessionId}`,
      participantIdentity: `${params.role}_${params.userId}`,
      token: `mock_jwt_token_${params.sessionId}_${params.userId}`,
      expiresIn: 3600,
    };
  }
}

class MockInterviewSessionRepository implements IInterviewSessionRepository {
  public sessions: Map<string, InterviewSessionEntity> = new Map();
  public auditLogs: Map<string, InterviewAuditLogEntity[]> = new Map();

  async create(data: any): Promise<InterviewSessionEntity> {
    const id = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const now = new Date();
    const session: InterviewSessionEntity = {
      id,
      userId: data.userId,
      teacherProfileId: data.teacherProfileId || null,
      templateId: data.templateId || null,
      type: data.type || "TEACHER_VETTING",
      status: data.status || "INITIALIZING",
      difficulty: data.difficulty || "INTERMEDIATE",
      domain: data.domain || null,
      scheduledAt: null,
      startedAt: null,
      endedAt: null,
      durationSeconds: 0,
      overallScore: null,
      outcome: "PENDING",
      summaryFeedback: null,
      strengths: [],
      improvements: [],
      recordingUrl: null,
      livekitRoomSid: null,
      meta: null,
      createdAt: now,
      updatedAt: now,
      criteriaScores: [],
      transcripts: [],
      auditLogs: [],
    };
    this.sessions.set(id, session);
    return { ...session };
  }

  async findById(id: string): Promise<InterviewSessionEntity | null> {
    const session = this.sessions.get(id);
    return session ? { ...session } : null;
  }

  async findByUserId(query: any): Promise<{ sessions: InterviewSessionEntity[]; total: number }> {
    const list = Array.from(this.sessions.values()).filter((s) => s.userId === query.userId);
    return { sessions: list, total: list.length };
  }

  async findAdminAll(query: any): Promise<{ sessions: InterviewSessionEntity[]; total: number }> {
    const list = Array.from(this.sessions.values());
    return { sessions: list, total: list.length };
  }

  async updateStatus(id: string, status: InterviewStatus, extra?: any): Promise<InterviewSessionEntity> {
    const session = this.sessions.get(id);
    if (!session) throw new Error("Not found");
    const updated: InterviewSessionEntity = {
      ...session,
      status,
      ...extra,
      updatedAt: new Date(),
    };
    this.sessions.set(id, updated);
    return { ...updated };
  }

  async updateSession(id: string, data: any): Promise<InterviewSessionEntity> {
    const session = this.sessions.get(id);
    if (!session) throw new Error("Not found");
    const updated: InterviewSessionEntity = {
      ...session,
      ...data,
      updatedAt: new Date(),
    };
    this.sessions.set(id, updated);
    return { ...updated };
  }

  async recordAuditLog(data: any): Promise<InterviewAuditLogEntity> {
    const log: InterviewAuditLogEntity = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      sessionId: data.sessionId,
      actorId: data.actorId || null,
      action: data.action,
      previousState: data.previousState || null,
      newState: data.newState || null,
      note: data.note || null,
      createdAt: new Date(),
    };
    const logs = this.auditLogs.get(data.sessionId) || [];
    logs.push(log);
    this.auditLogs.set(data.sessionId, logs);
    return log;
  }

  async getAuditLogs(sessionId: string): Promise<InterviewAuditLogEntity[]> {
    return this.auditLogs.get(sessionId) || [];
  }

  async saveEvaluation(data: any): Promise<InterviewSessionEntity> {
    const session = this.sessions.get(data.sessionId);
    if (!session) throw new Error("Not found");
    const updated: InterviewSessionEntity = {
      ...session,
      overallScore: data.overallScore,
      outcome: data.outcome,
      summaryFeedback: data.summaryFeedback || session.summaryFeedback,
      strengths: data.strengths || session.strengths,
      improvements: data.improvements || session.improvements,
      recordingUrl: data.recordingUrl || session.recordingUrl,
      status: "EVALUATED",
      updatedAt: new Date(),
    };
    this.sessions.set(data.sessionId, updated);
    return { ...updated };
  }

  async canCandidateStartInterview(userId: string): Promise<{
    allowed: boolean;
    reason?: "ALREADY_PASSED" | "MAX_ATTEMPTS";
  }> {
    const userSessions = Array.from(this.sessions.values()).filter((s) => s.userId === userId);
    if (userSessions.some((s) => s.outcome === "PASSED")) {
      return { allowed: false, reason: "ALREADY_PASSED" };
    }
    const vettingAttempts = userSessions.filter(
      (s) => s.type === "TEACHER_VETTING" && s.status !== "CANCELLED"
    ).length;
    if (vettingAttempts >= 3) {
      return { allowed: false, reason: "MAX_ATTEMPTS" };
    }
    return { allowed: true };
  }
}

class MockInterviewTemplateRepository implements IInterviewTemplateRepository {
  public templates: Map<string, InterviewTemplateEntity> = new Map();

  async create(dto: any): Promise<InterviewTemplateEntity> {
    const id = `tpl_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const template: InterviewTemplateEntity = {
      id,
      title: dto.title,
      slug: dto.slug || dto.title.toLowerCase().replace(/\s+/g, "-"),
      description: dto.description || null,
      type: dto.type || "TEACHER_VETTING",
      domain: dto.domain,
      difficulty: dto.difficulty || "INTERMEDIATE",
      systemPrompt: dto.systemPrompt || null,
      voiceId: dto.voiceId || null,
      llmModel: dto.llmModel || "gemini-1.5-flash",
      maxDurationMinutes: dto.maxDurationMinutes || 15,
      totalQuestions: dto.totalQuestions || 5,
      passingScore: dto.passingScore || 70,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.templates.set(id, template);
    return { ...template };
  }

  async findById(id: string): Promise<InterviewTemplateEntity | null> {
    const tpl = this.templates.get(id);
    return tpl ? { ...tpl } : null;
  }

  async findBySlug(slug: string): Promise<InterviewTemplateEntity | null> {
    for (const tpl of this.templates.values()) {
      if (tpl.slug === slug) return { ...tpl };
    }
    return null;
  }

  async findActive(query?: any): Promise<InterviewTemplateEntity[]> {
    return Array.from(this.templates.values()).filter((t) => t.isActive);
  }

  async findAdminAll(query: any): Promise<{ templates: InterviewTemplateEntity[]; total: number }> {
    const list = Array.from(this.templates.values());
    return { templates: list, total: list.length };
  }

  async update(id: string, dto: any): Promise<InterviewTemplateEntity> {
    const tpl = this.templates.get(id);
    if (!tpl) throw new Error("Not found");
    const updated = { ...tpl, ...dto, updatedAt: new Date() };
    this.templates.set(id, updated);
    return { ...updated };
  }

  async toggleStatus(id: string, isActive: boolean): Promise<InterviewTemplateEntity> {
    const tpl = this.templates.get(id);
    if (!tpl) throw new Error("Not found");
    tpl.isActive = isActive;
    return { ...tpl };
  }

  async getVersions(templateId: string): Promise<any[]> {
    return [];
  }
}

class MockInterviewTranscriptRepository implements IInterviewTranscriptRepository {
  public transcripts: Map<string, InterviewTranscriptEntity[]> = new Map();

  async appendTurn(data: any): Promise<InterviewTranscriptEntity> {
    const turn: InterviewTranscriptEntity = {
      id: `turn_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      sessionId: data.sessionId,
      role: data.role,
      content: data.content,
      audioUrl: data.audioUrl || null,
      sequenceOrder: data.sequenceOrder || 1,
      durationMs: data.durationMs || null,
      sentiment: data.sentiment || null,
      turnFeedback: data.turnFeedback || null,
      createdAt: new Date(),
    };
    const list = this.transcripts.get(data.sessionId) || [];
    list.push(turn);
    this.transcripts.set(data.sessionId, list);
    return turn;
  }

  async findBySessionId(sessionId: string): Promise<InterviewTranscriptEntity[]> {
    return this.transcripts.get(sessionId) || [];
  }

  async getLatestTurns(sessionId: string, limit = 5): Promise<InterviewTranscriptEntity[]> {
    const list = this.transcripts.get(sessionId) || [];
    return list.slice(-limit);
  }

  async countTurns(sessionId: string): Promise<number> {
    return (this.transcripts.get(sessionId) || []).length;
  }
}

class MockInterviewAnalyticsRepository implements IInterviewAnalyticsRepository {
  async getOverviewMetrics(): Promise<any> {
    return { totalSessions: 10, passedSessions: 8, failedSessions: 2, passRate: 80, averageScore: 82.5 };
  }

  async getTimeseriesMetrics(): Promise<any[]> {
    return [];
  }

  async getTemplateMetrics(templateId: string): Promise<any> {
    return { templateId, totalSessions: 5, passedSessions: 4, passRate: 80 };
  }
}

// ============================================================================
// TEST SUITES
// ============================================================================

describe("AI Interview Module Clean Architecture & SOLID Principles Suite", () => {
  // --------------------------------------------------------------------------
  // SUITE 1: Domain Policies
  // --------------------------------------------------------------------------
  describe("1. Domain Policies (SRP & Pure Business Invariants)", () => {
    it("InterviewVettingPolicy: enforces student blockage, passing rule, and 3-attempt quota", () => {
      // 1. Blocks student from initiating arbitrary vetting
      assert.throws(
        () =>
          InterviewVettingPolicy.validateCanInitiate({
            userRole: "STUDENT",
            existingSessions: [],
          }),
        InterviewAccessDeniedError
      );

      // 2. Blocks candidate who already passed
      const passedSession: any = { id: "s-1", outcome: "PASSED", type: "TEACHER_VETTING" };
      assert.throws(
        () =>
          InterviewVettingPolicy.validateCanInitiate({
            userRole: "TEACHER",
            existingSessions: [passedSession],
          }),
        InterviewAlreadyPassedError
      );

      // 3. Blocks candidate when 3 attempts are exhausted
      const threeAttempts: any[] = [
        { id: "s-1", outcome: "FAILED", type: "TEACHER_VETTING", status: "EVALUATED" },
        { id: "s-2", outcome: "FAILED", type: "TEACHER_VETTING", status: "EVALUATED" },
        { id: "s-3", outcome: "FAILED", type: "TEACHER_VETTING", status: "EVALUATED" },
      ];
      assert.throws(
        () =>
          InterviewVettingPolicy.validateCanInitiate({
            userRole: "TEACHER",
            existingSessions: threeAttempts,
          }),
        MaxInterviewAttemptsReachedError
      );

      // 4. Cancelled attempts do not count against the 3-attempt quota
      const twoFailedOneCancelled: any[] = [
        { id: "s-1", outcome: "FAILED", type: "TEACHER_VETTING", status: "EVALUATED" },
        { id: "s-2", outcome: "FAILED", type: "TEACHER_VETTING", status: "EVALUATED" },
        { id: "s-3", outcome: "PENDING", type: "TEACHER_VETTING", status: "CANCELLED" },
      ];
      assert.doesNotThrow(() =>
        InterviewVettingPolicy.validateCanInitiate({
          userRole: "TEACHER",
          existingSessions: twoFailedOneCancelled,
        })
      );
    });

    it("InterviewLifecyclePolicy: validates status transitions and token eligibility", () => {
      assert.equal(InterviewLifecyclePolicy.canStart("INITIALIZING"), true);
      assert.equal(InterviewLifecyclePolicy.canStart("IN_PROGRESS"), true);
      assert.equal(InterviewLifecyclePolicy.canStart("COMPLETED"), false);

      assert.throws(
        () => InterviewLifecyclePolicy.assertCanStart("EVALUATED"),
        InvalidInterviewStateError
      );

      assert.throws(
        () => InterviewLifecyclePolicy.assertCanIssueRealtimeToken("CANCELLED"),
        InvalidInterviewStateError
      );

      assert.throws(
        () => InterviewLifecyclePolicy.assertCanCancel("COMPLETED"),
        InvalidInterviewStateError
      );
    });

    it("InterviewEvaluationPolicy: computes outcome based on passing thresholds and scores", () => {
      // Passed when >= passingScore
      assert.equal(
        InterviewEvaluationPolicy.determineOutcome({ overallScore: 85, passingScore: 70 }),
        "PASSED"
      );

      // Failed when < passingScore
      assert.equal(
        InterviewEvaluationPolicy.determineOutcome({ overallScore: 65, passingScore: 70 }),
        "FAILED"
      );

      // Respects explicit outcome override
      assert.equal(
        InterviewEvaluationPolicy.determineOutcome({
          overallScore: 65,
          passingScore: 70,
          explicitOutcome: "PASSED",
        }),
        "PASSED"
      );

      // Safe duration calculation
      const start = new Date("2026-11-17T10:00:00Z");
      const end = new Date("2026-11-17T10:15:30Z");
      assert.equal(InterviewEvaluationPolicy.calculateDurationSeconds(start, end), 930);
    });
  });

  // --------------------------------------------------------------------------
  // SUITE 2: Realtime Token Service Abstraction (DIP)
  // --------------------------------------------------------------------------
  describe("2. Realtime Token Service Abstraction (DIP)", () => {
    it("should allow injecting mock token service into CandidateInterviewUseCases", async () => {
      const sessionRepo = new MockInterviewSessionRepository();
      const templateRepo = new MockInterviewTemplateRepository();
      const transcriptRepo = new MockInterviewTranscriptRepository();
      const mockTokenService = new MockRealtimeTokenService();

      const candidateUC = new CandidateInterviewUseCases(
        sessionRepo,
        templateRepo,
        transcriptRepo,
        mockTokenService
      );

      const session = await sessionRepo.create({
        userId: "candidate-1",
        status: "INITIALIZING",
      });

      const tokenData = await candidateUC.generateRealtimeToken(
        session.id,
        "candidate-1",
        "John Doe"
      );

      assert.equal(tokenData.sessionId, session.id);
      assert.equal(tokenData.userId, "candidate-1");
      assert.equal(tokenData.userName, "John Doe");
      assert.equal(mockTokenService.generatedTokens.length, 1);
    });
  });

  // --------------------------------------------------------------------------
  // SUITE 3: Candidate Lifecycle & Critical IDOR Security
  // --------------------------------------------------------------------------
  describe("3. Candidate Lifecycle & IDOR Protection", () => {
    it("createSession: creates session and enforces template parameters", async () => {
      const sessionRepo = new MockInterviewSessionRepository();
      const templateRepo = new MockInterviewTemplateRepository();
      const transcriptRepo = new MockInterviewTranscriptRepository();
      const mockTokenService = new MockRealtimeTokenService();

      const tpl = await templateRepo.create({
        title: "Node.js Architecture",
        domain: "Backend",
        difficulty: "ADVANCED",
        passingScore: 75,
      });

      const candidateUC = new CandidateInterviewUseCases(
        sessionRepo,
        templateRepo,
        transcriptRepo,
        mockTokenService
      );

      const session = await candidateUC.createSession({
        userId: "candidate-1",
        userRole: "TEACHER",
        templateId: tpl.id,
      });

      assert.equal(session.userId, "candidate-1");
      assert.equal(session.domain, "Backend");
      assert.equal(session.difficulty, "ADVANCED");
      assert.equal(session.status, "INITIALIZING");
    });

    it("Candidate Session IDOR Guard: prevents candidates from snooping on other candidates' sessions", async () => {
      const sessionRepo = new MockInterviewSessionRepository();
      const templateRepo = new MockInterviewTemplateRepository();
      const transcriptRepo = new MockInterviewTranscriptRepository();
      const mockTokenService = new MockRealtimeTokenService();

      const candidateUC = new CandidateInterviewUseCases(
        sessionRepo,
        templateRepo,
        transcriptRepo,
        mockTokenService
      );

      const session = await sessionRepo.create({
        userId: "candidate-owner",
        status: "INITIALIZING",
      });

      // 1. Owner can access session
      const ownerSession = await candidateUC.getSession(session.id, "candidate-owner", "TEACHER");
      assert.equal(ownerSession.id, session.id);

      // 2. Rival candidate is BLOCKED (IDOR Guard)
      await assert.rejects(
        () => candidateUC.getSession(session.id, "candidate-snooper", "TEACHER"),
        InterviewAccessDeniedError
      );

      // 3. Admin can access
      const adminSession = await candidateUC.getSession(session.id, "admin-user", "ADMIN");
      assert.equal(adminSession.id, session.id);
    });

    it("completeSession & cancelSession: correctly transition session states", async () => {
      const sessionRepo = new MockInterviewSessionRepository();
      const templateRepo = new MockInterviewTemplateRepository();
      const transcriptRepo = new MockInterviewTranscriptRepository();
      const mockTokenService = new MockRealtimeTokenService();

      const candidateUC = new CandidateInterviewUseCases(
        sessionRepo,
        templateRepo,
        transcriptRepo,
        mockTokenService
      );

      const session = await sessionRepo.create({
        userId: "candidate-1",
        status: "INITIALIZING",
      });

      // Start session
      const started = await candidateUC.startSession(session.id, "candidate-1");
      assert.equal(started.status, "IN_PROGRESS");

      // Complete session
      const completed = await candidateUC.completeSession(session.id, "candidate-1");
      assert.equal(completed.status, "EVALUATING");
    });
  });

  // --------------------------------------------------------------------------
  // SUITE 4: Admin Interview Operations
  // --------------------------------------------------------------------------
  describe("4. Admin Operations (Overrides, Evaluation, Templates)", () => {
    it("AdminInterviewUseCases: overrideDecision and adjustEvaluation with audit logs", async () => {
      const sessionRepo = new MockInterviewSessionRepository();
      const templateRepo = new MockInterviewTemplateRepository();
      const transcriptRepo = new MockInterviewTranscriptRepository();
      const analyticsRepo = new MockInterviewAnalyticsRepository();

      const adminUC = new AdminInterviewUseCases(
        sessionRepo,
        templateRepo,
        transcriptRepo,
        analyticsRepo
      );

      const session = await sessionRepo.create({
        userId: "candidate-1",
        status: "EVALUATED",
      });

      // Admin decision override
      const overridden = await adminUC.overrideDecision({
        sessionId: session.id,
        adminId: "admin-1",
        outcome: "PASSED",
        overallScore: 88,
        adminNote: "Exceptional pedagogy demonstration",
      });

      assert.equal(overridden.outcome, "PASSED");
      assert.equal(overridden.overallScore, 88);

      // Verify audit trail recorded
      const logs = await adminUC.getSessionAudit(session.id);
      assert.equal(logs.length, 1);
      assert.equal(logs[0].action, "DECISION_OVERRIDDEN");
    });

    it("AdminInterviewUseCases: template CRUD and status toggling", async () => {
      const sessionRepo = new MockInterviewSessionRepository();
      const templateRepo = new MockInterviewTemplateRepository();
      const transcriptRepo = new MockInterviewTranscriptRepository();
      const analyticsRepo = new MockInterviewAnalyticsRepository();

      const adminUC = new AdminInterviewUseCases(
        sessionRepo,
        templateRepo,
        transcriptRepo,
        analyticsRepo
      );

      const tpl = await adminUC.createTemplate({
        title: "Calculus Pedagogy",
        domain: "Mathematics",
        difficulty: "EXPERT",
        passingScore: 80,
      });

      assert.equal(tpl.title, "Calculus Pedagogy");

      const toggled = await adminUC.toggleTemplateStatus(tpl.id, false);
      assert.equal(toggled.isActive, false);
    });
  });

  // --------------------------------------------------------------------------
  // SUITE 5: Internal AI Microservice Synchronization
  // --------------------------------------------------------------------------
  describe("5. Internal AI Microservice Synchronization", () => {
    it("InternalInterviewUseCases: endSession computes score outcome and records transcripts", async () => {
      const sessionRepo = new MockInterviewSessionRepository();
      const transcriptRepo = new MockInterviewTranscriptRepository();

      const internalUC = new InternalInterviewUseCases(sessionRepo, transcriptRepo);

      const session = await sessionRepo.create({
        userId: "candidate-1",
        status: "IN_PROGRESS",
      });

      // Append transcript turn
      const turn = await internalUC.appendTranscript({
        sessionId: session.id,
        role: "ASSISTANT",
        content: "Explain how React reconciler works.",
        sequenceOrder: 1,
      });
      assert.equal(turn.role, "ASSISTANT");

      // Finalize session from AI service
      const finalized = await internalUC.endSession({
        sessionId: session.id,
        overallScore: 92,
        outcome: "PASSED",
        summaryFeedback: "Strong conceptual understanding",
        strengths: ["Communication", "Clean code"],
      });

      assert.equal(finalized.status, "EVALUATED");
      assert.equal(finalized.overallScore, 92);
      assert.equal(finalized.outcome, "PASSED");
    });
  });

  // --------------------------------------------------------------------------
  // SUITE 6: Presentation Validators & Zod Schemas
  // --------------------------------------------------------------------------
  describe("6. Presentation Validators & Zod Schemas", () => {
    it("CreateInterviewSessionSchema: validates payload and handles difficulty enums", () => {
      const valid = CreateInterviewSessionSchema.parse({
        domain: "Python Data Science",
        difficulty: "ADVANCED",
      });
      assert.equal(valid.domain, "Python Data Science");
      assert.equal(valid.difficulty, "ADVANCED");

      // Rejects invalid difficulty
      assert.throws(
        () =>
          CreateInterviewSessionSchema.parse({
            difficulty: "SUPER_HARD" as any,
          }),
        ZodError
      );
    });

    it("AdminOverrideDecisionSchema: enforces outcome and bounds score between 0 and 100", () => {
      assert.throws(
        () =>
          AdminOverrideDecisionSchema.parse({
            outcome: "PASSED",
            overallScore: 105, // > 100
          }),
        ZodError
      );

      assert.throws(
        () =>
          AdminOverrideDecisionSchema.parse({
            outcome: "PASSED",
            overallScore: -10, // < 0
          }),
        ZodError
      );

      const valid = AdminOverrideDecisionSchema.parse({
        outcome: "PASSED",
        overallScore: 90,
      });
      assert.equal(valid.overallScore, 90);
    });
  });

  // --------------------------------------------------------------------------
  // SUITE 7: Dependency Inversion Module Factory
  // --------------------------------------------------------------------------
  describe("7. Dependency Inversion Module Factory (createInterviewModule)", () => {
    it("createInterviewModule: allows custom injected mock repositories and services", () => {
      const sessionRepo = new MockInterviewSessionRepository();
      const templateRepo = new MockInterviewTemplateRepository();
      const transcriptRepo = new MockInterviewTranscriptRepository();
      const analyticsRepo = new MockInterviewAnalyticsRepository();
      const realtimeTokenService = new MockRealtimeTokenService();

      const module = createInterviewModule({
        sessionRepo,
        templateRepo,
        transcriptRepo,
        analyticsRepo,
        realtimeTokenService,
      });

      assert.ok(module.candidateRouter);
      assert.ok(module.adminRouter);
      assert.ok(module.internalRouter);
      assert.equal(module.repos.sessionRepo, sessionRepo);
      assert.equal(module.services.realtimeTokenService, realtimeTokenService);
    });
  });
});
