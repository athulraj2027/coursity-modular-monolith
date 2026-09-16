import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";

// Repositories & Interfaces
import { IInterviewSessionRepository } from "../src/modules/interview/domain/repositories/interview-session.repository.interface";
import { IInterviewTemplateRepository } from "../src/modules/interview/domain/repositories/interview-template.repository.interface";
import { IInterviewTranscriptRepository } from "../src/modules/interview/domain/repositories/interview-transcript.repository.interface";
import { IInterviewAnalyticsRepository } from "../src/modules/interview/domain/repositories/interview-analytics.repository.interface";
import { RealtimeTokenService } from "../src/modules/interview/infrastructure/services/realtime-token.service";

// Entities
import {
  InterviewAuditLogEntity,
  InterviewSessionEntity,
  InterviewTemplateEntity,
  InterviewTemplateVersionEntity,
  InterviewTranscriptEntity,
} from "../src/modules/interview/domain/entities/interview.entity";

// Use Cases
import { CandidateInterviewUseCases } from "../src/modules/interview/application/use-cases/candidate-interview.usecases";
import { AdminInterviewUseCases } from "../src/modules/interview/application/use-cases/admin-interview.usecases";
import { InternalInterviewUseCases } from "../src/modules/interview/application/use-cases/internal-interview.usecases";

// Errors
import {
  InterviewAccessDeniedError,
  InterviewNotFoundError,
  InvalidInterviewStateError,
  TemplateNotFoundError,
} from "../src/modules/interview/domain/errors/interview.error";

// ==========================================
// IN-MEMORY MOCK REPOSITORIES
// ==========================================

class MockInterviewSessionRepository implements IInterviewSessionRepository {
  public sessions: InterviewSessionEntity[] = [];
  public auditLogs: InterviewAuditLogEntity[] = [];

  async create(data: any): Promise<InterviewSessionEntity> {
    const session: InterviewSessionEntity = {
      id: `session_${Math.random().toString(36).substring(2, 9)}`,
      userId: data.userId,
      teacherProfileId: data.teacherProfileId || null,
      templateId: data.templateId || null,
      type: data.type || "TEACHER_VETTING",
      status: data.status || "INITIALIZING",
      difficulty: data.difficulty || "INTERMEDIATE",
      domain: data.domain || "General",
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
      createdAt: new Date(),
      updatedAt: new Date(),
      criteriaScores: [],
      transcripts: [],
      auditLogs: [],
    };
    this.sessions.push(session);
    return session;
  }

  async findById(id: string): Promise<InterviewSessionEntity | null> {
    return this.sessions.find((s) => s.id === id) || null;
  }

  async findByUserId(query: any): Promise<{ sessions: InterviewSessionEntity[]; total: number }> {
    const matches = this.sessions.filter((s) => s.userId === query.userId);
    return { sessions: matches, total: matches.length };
  }

  async findAdminAll(query: any): Promise<{ sessions: InterviewSessionEntity[]; total: number }> {
    let matches = [...this.sessions];
    if (query.status) matches = matches.filter((s) => s.status === query.status);
    if (query.outcome) matches = matches.filter((s) => s.outcome === query.outcome);
    return { sessions: matches, total: matches.length };
  }

  async updateStatus(id: string, status: any, extra?: any): Promise<InterviewSessionEntity> {
    const session = await this.findById(id);
    if (!session) throw new Error("Session not found");
    session.status = status;
    if (extra) Object.assign(session, extra);
    session.updatedAt = new Date();
    return session;
  }

  async updateSession(id: string, data: any): Promise<InterviewSessionEntity> {
    const session = await this.findById(id);
    if (!session) throw new Error("Session not found");
    Object.assign(session, data, { updatedAt: new Date() });
    return session;
  }

  async recordAuditLog(data: any): Promise<InterviewAuditLogEntity> {
    const log: InterviewAuditLogEntity = {
      id: `audit_${Math.random().toString(36).substring(2, 9)}`,
      sessionId: data.sessionId,
      actorId: data.actorId || null,
      action: data.action,
      previousState: data.previousState,
      newState: data.newState,
      note: data.note || null,
      createdAt: new Date(),
    };
    this.auditLogs.push(log);
    return log;
  }

  async getAuditLogs(sessionId: string): Promise<InterviewAuditLogEntity[]> {
    return this.auditLogs.filter((l) => l.sessionId === sessionId);
  }

  async saveEvaluation(data: any): Promise<InterviewSessionEntity> {
    const session = await this.findById(data.sessionId);
    if (!session) throw new Error("Session not found");
    session.status = "EVALUATED";
    session.overallScore = data.overallScore;
    session.outcome = data.outcome;
    session.summaryFeedback = data.summaryFeedback || null;
    session.strengths = data.strengths || [];
    session.improvements = data.improvements || [];
    if (data.recordingUrl) session.recordingUrl = data.recordingUrl;
    if (data.criteriaScores) {
      session.criteriaScores = data.criteriaScores.map((c: any) => ({
        id: `score_${Math.random().toString(36).substring(2, 9)}`,
        sessionId: data.sessionId,
        criterion: c.criterion,
        score: c.score,
        maxScore: c.maxScore || 100,
        weight: c.weight || 1.0,
        feedback: c.feedback || null,
        createdAt: new Date(),
      }));
    }
    session.endedAt = new Date();
    return session;
  }
}

class MockInterviewTemplateRepository implements IInterviewTemplateRepository {
  public templates: InterviewTemplateEntity[] = [];
  public versions: InterviewTemplateVersionEntity[] = [];

  async create(dto: any): Promise<InterviewTemplateEntity> {
    const template: InterviewTemplateEntity = {
      id: `template_${Math.random().toString(36).substring(2, 9)}`,
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
      passingScore: dto.passingScore || 70.0,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.templates.push(template);

    this.versions.push({
      id: `v_${Math.random().toString(36).substring(2, 9)}`,
      templateId: template.id,
      version: 1,
      title: template.title,
      systemPrompt: template.systemPrompt,
      voiceId: template.voiceId,
      llmModel: template.llmModel,
      maxDurationMinutes: template.maxDurationMinutes,
      totalQuestions: template.totalQuestions,
      passingScore: template.passingScore,
      changeLog: "Initial template creation",
      createdBy: dto.adminId || null,
      createdAt: new Date(),
    });

    return template;
  }

  async findById(id: string): Promise<InterviewTemplateEntity | null> {
    return this.templates.find((t) => t.id === id) || null;
  }

  async findBySlug(slug: string): Promise<InterviewTemplateEntity | null> {
    return this.templates.find((t) => t.slug === slug) || null;
  }

  async findActive(): Promise<InterviewTemplateEntity[]> {
    return this.templates.filter((t) => t.isActive);
  }

  async findAdminAll(): Promise<{ templates: InterviewTemplateEntity[]; total: number }> {
    return { templates: this.templates, total: this.templates.length };
  }

  async update(id: string, dto: any): Promise<InterviewTemplateEntity> {
    const template = await this.findById(id);
    if (!template) throw new Error("Template not found");
    Object.assign(template, dto, { updatedAt: new Date() });

    const existingVersions = this.versions.filter((v) => v.templateId === id);
    const nextVer = existingVersions.length + 1;

    this.versions.push({
      id: `v_${Math.random().toString(36).substring(2, 9)}`,
      templateId: template.id,
      version: nextVer,
      title: template.title,
      systemPrompt: template.systemPrompt,
      voiceId: template.voiceId,
      llmModel: template.llmModel,
      maxDurationMinutes: template.maxDurationMinutes,
      totalQuestions: template.totalQuestions,
      passingScore: template.passingScore,
      changeLog: dto.changeLog || "Updated template",
      createdBy: dto.adminId || null,
      createdAt: new Date(),
    });

    return template;
  }

  async toggleStatus(id: string, isActive: boolean): Promise<InterviewTemplateEntity> {
    const template = await this.findById(id);
    if (!template) throw new Error("Template not found");
    template.isActive = isActive;
    return template;
  }

  async getVersions(templateId: string): Promise<InterviewTemplateVersionEntity[]> {
    return this.versions.filter((v) => v.templateId === templateId);
  }
}

class MockInterviewTranscriptRepository implements IInterviewTranscriptRepository {
  public transcripts: InterviewTranscriptEntity[] = [];

  async appendTurn(data: any): Promise<InterviewTranscriptEntity> {
    const transcript: InterviewTranscriptEntity = {
      id: `turn_${Math.random().toString(36).substring(2, 9)}`,
      sessionId: data.sessionId,
      role: data.role,
      content: data.content,
      audioUrl: data.audioUrl || null,
      sequenceOrder: data.sequenceOrder || this.transcripts.length + 1,
      durationMs: data.durationMs || null,
      sentiment: data.sentiment || null,
      turnFeedback: data.turnFeedback || null,
      createdAt: new Date(),
    };
    this.transcripts.push(transcript);
    return transcript;
  }

  async findBySessionId(sessionId: string): Promise<InterviewTranscriptEntity[]> {
    return this.transcripts
      .filter((t) => t.sessionId === sessionId)
      .sort((a, b) => a.sequenceOrder - b.sequenceOrder);
  }

  async getLatestTurns(sessionId: string, limit: number = 5): Promise<InterviewTranscriptEntity[]> {
    const list = this.transcripts.filter((t) => t.sessionId === sessionId);
    return list.slice(-limit);
  }

  async countTurns(sessionId: string): Promise<number> {
    return this.transcripts.filter((t) => t.sessionId === sessionId).length;
  }
}

class MockInterviewAnalyticsRepository implements IInterviewAnalyticsRepository {
  constructor(private readonly sessionRepo: MockInterviewSessionRepository) {}

  async getOverviewMetrics(): Promise<any> {
    const sessions = this.sessionRepo.sessions;
    const total = sessions.length;
    const completed = sessions.filter((s) => s.status === "COMPLETED" || s.status === "EVALUATED").length;
    const passed = sessions.filter((s) => s.outcome === "PASSED").length;
    const failed = sessions.filter((s) => s.outcome === "FAILED").length;
    return {
      totalInterviews: total,
      completedInterviews: completed,
      passedCount: passed,
      failedCount: failed,
      passRatePercentage: completed > 0 ? (passed / completed) * 100 : 0,
      averageScore: 85,
      averageDurationSeconds: 600,
      statusDistribution: {},
      outcomeDistribution: {},
    };
  }

  async getTimeseriesMetrics(): Promise<any[]> {
    return [
      { date: "2026-09-15", total: 5, passed: 4, failed: 1, averageScore: 82.5 },
      { date: "2026-09-16", total: 8, passed: 7, failed: 1, averageScore: 88.0 },
    ];
  }

  async getTemplateMetrics(templateId: string): Promise<any> {
    return {
      templateId,
      totalSessions: 10,
      completedSessions: 8,
      passedSessions: 7,
      failedSessions: 1,
      passRate: 87.5,
      averageScore: 86.4,
      averageDurationSeconds: 720,
    };
  }
}

// ==========================================
// TEST SUITE
// ==========================================

describe("AI Interview Module - Full Clean Architecture Suite", () => {
  let sessionRepo: MockInterviewSessionRepository;
  let templateRepo: MockInterviewTemplateRepository;
  let transcriptRepo: MockInterviewTranscriptRepository;
  let analyticsRepo: MockInterviewAnalyticsRepository;
  let tokenService: RealtimeTokenService;

  let candidateUseCases: CandidateInterviewUseCases;
  let adminUseCases: AdminInterviewUseCases;
  let internalUseCases: InternalInterviewUseCases;

  const candidateId = "user_candidate_123";
  const adminId = "user_admin_999";

  beforeEach(async () => {
    sessionRepo = new MockInterviewSessionRepository();
    templateRepo = new MockInterviewTemplateRepository();
    transcriptRepo = new MockInterviewTranscriptRepository();
    analyticsRepo = new MockInterviewAnalyticsRepository(sessionRepo);
    tokenService = new RealtimeTokenService();

    candidateUseCases = new CandidateInterviewUseCases(
      sessionRepo,
      templateRepo,
      transcriptRepo,
      tokenService
    );

    adminUseCases = new AdminInterviewUseCases(
      sessionRepo,
      templateRepo,
      transcriptRepo,
      analyticsRepo
    );

    internalUseCases = new InternalInterviewUseCases(
      sessionRepo,
      transcriptRepo
    );
  });

  // -------------------------------------------------------------
  // 1. CANDIDATE APIS (13 Endpoints Flow)
  // -------------------------------------------------------------
  describe("Candidate Interview Flows", () => {
    it("should list active templates and retrieve by slug", async () => {
      const created = await adminUseCases.createTemplate({
        title: "Node.js Architecture Vetting",
        domain: "Backend Engineering",
        difficulty: "ADVANCED",
        passingScore: 75.0,
      });

      const templates = await candidateUseCases.getActiveTemplates();
      assert.equal(templates.length, 1);
      assert.equal(templates[0].id, created.id);

      const bySlug = await candidateUseCases.getTemplateBySlug(created.slug);
      assert.equal(bySlug.title, "Node.js Architecture Vetting");
    });

    it("should create, start, and retrieve session token", async () => {
      const template = await adminUseCases.createTemplate({
        title: "TypeScript Deep-Dive",
        domain: "Web Development",
        difficulty: "INTERMEDIATE",
      });

      const session = await candidateUseCases.createSession({
        userId: candidateId,
        templateId: template.id,
      });

      assert.equal(session.status, "INITIALIZING");
      assert.equal(session.domain, "Web Development");

      const started = await candidateUseCases.startSession(session.id, candidateId);
      assert.equal(started.status, "IN_PROGRESS");
      assert.ok(started.startedAt);

      const tokenData = await candidateUseCases.generateRealtimeToken(
        session.id,
        candidateId,
        "John Doe"
      );
      assert.ok(tokenData.token);
      assert.equal(tokenData.sessionId, session.id);
      assert.equal(tokenData.roomName, `interview-room-${session.id}`);
    });

    it("should prevent unauthorized users from accessing candidate sessions", async () => {
      const session = await candidateUseCases.createSession({
        userId: candidateId,
        domain: "Calculus",
      });

      await assert.rejects(
        async () => {
          await candidateUseCases.getSession(session.id, "intruder_user_456", "STUDENT");
        },
        (err: any) => err instanceof InterviewAccessDeniedError
      );
    });

    it("should append speech turns and fetch transcripts", async () => {
      const session = await candidateUseCases.createSession({
        userId: candidateId,
        domain: "Data Structures",
      });

      await internalUseCases.appendTranscript({
        sessionId: session.id,
        role: "ASSISTANT",
        content: "Can you explain how a balanced binary search tree operates?",
        sequenceOrder: 1,
      });

      await internalUseCases.appendTranscript({
        sessionId: session.id,
        role: "CANDIDATE",
        content: "In an AVL or Red-Black tree, rotations maintain logarithmic height...",
        sequenceOrder: 2,
        sentiment: "CONFIDENT",
      });

      const transcripts = await candidateUseCases.getTranscripts(session.id, candidateId, "STUDENT");
      assert.equal(transcripts.length, 2);
      assert.equal(transcripts[0].role, "ASSISTANT");
      assert.equal(transcripts[1].role, "CANDIDATE");
      assert.equal(transcripts[1].sentiment, "CONFIDENT");

      const latest = await candidateUseCases.getLatestTranscripts(session.id, candidateId, 1);
      assert.equal(latest.length, 1);
      assert.equal(latest[0].sequenceOrder, 2);
    });

    it("should submit session for evaluation and fetch final report and recording", async () => {
      const session = await candidateUseCases.createSession({
        userId: candidateId,
        domain: "System Design",
      });
      await candidateUseCases.startSession(session.id, candidateId);

      const evaluatingSession = await candidateUseCases.completeSession(session.id, candidateId);
      assert.equal(evaluatingSession.status, "EVALUATING");

      // Internal AI service processes evaluation
      await internalUseCases.endSession({
        sessionId: session.id,
        overallScore: 88.5,
        outcome: "PASSED",
        summaryFeedback: "Outstanding grasp of distributed caching and partitioning.",
        strengths: ["Clear diagramming", "Consistent terminology"],
        improvements: ["Could dive deeper into consensus protocols"],
        recordingUrl: "https://s3.amazonaws.com/coursity-media/recordings/session123.mp4",
        criteriaScores: [
          { criterion: "System Architecture", score: 92.0 },
          { criterion: "Scalability Principles", score: 85.0 },
        ],
      });

      const report = await candidateUseCases.getReport(session.id, candidateId, "STUDENT");
      assert.equal(report.status, "EVALUATED");
      assert.equal(report.overallScore, 88.5);
      assert.equal(report.outcome, "PASSED");
      assert.equal(report.criteriaScores?.length, 2);

      const rec = await candidateUseCases.getRecordingUrl(session.id, candidateId, "STUDENT");
      assert.equal(rec.isReady, true);
      assert.equal(rec.recordingUrl, "https://s3.amazonaws.com/coursity-media/recordings/session123.mp4");
    });
  });

  // -------------------------------------------------------------
  // 2. ADMIN APIS (12 Endpoints Flow)
  // -------------------------------------------------------------
  describe("Admin Vetting & Evaluation Management", () => {
    it("should list sessions, inspect deep details, and override decisions", async () => {
      const session = await candidateUseCases.createSession({
        userId: candidateId,
        domain: "DevOps & Kubernetes",
      });

      const list = await adminUseCases.getSessions({});
      assert.equal(list.total, 1);

      const details = await adminUseCases.getSessionDetails(session.id);
      assert.equal(details.domain, "DevOps & Kubernetes");

      const overridden = await adminUseCases.overrideDecision({
        sessionId: session.id,
        adminId,
        outcome: "PASSED",
        overallScore: 90.0,
        adminNote: "Candidate showcased exceptional practical experience in manual review.",
      });

      assert.equal(overridden.outcome, "PASSED");
      assert.equal(overridden.overallScore, 90.0);

      const auditLogs = await adminUseCases.getSessionAudit(session.id);
      assert.ok(auditLogs.some((log) => log.action === "DECISION_OVERRIDDEN"));
    });

    it("should manage template versions and toggle active status", async () => {
      const template = await adminUseCases.createTemplate({
        title: "Calculus Educator Assessment",
        domain: "Mathematics",
        passingScore: 70.0,
        adminId,
      });

      const v1List = await adminUseCases.getTemplateVersions(template.id);
      assert.equal(v1List.length, 1);
      assert.equal(v1List[0].version, 1);

      const updated = await adminUseCases.updateTemplate(template.id, {
        passingScore: 80.0,
        changeLog: "Increased passing threshold to 80%",
        adminId,
      });

      assert.equal(updated.passingScore, 80.0);

      const v2List = await adminUseCases.getTemplateVersions(template.id);
      assert.equal(v2List.length, 2);
      assert.equal(v2List[1].version, 2);
      assert.equal(v2List[1].passingScore, 80.0);

      const deactivated = await adminUseCases.toggleTemplateStatus(template.id, false);
      assert.equal(deactivated.isActive, false);
    });

    it("should fetch overview and timeseries analytics", async () => {
      const overview = await adminUseCases.getAnalyticsOverview();
      assert.ok(overview.passRatePercentage !== undefined);

      const timeseries = await adminUseCases.getAnalyticsTimeseries(30);
      assert.ok(Array.isArray(timeseries));
      assert.equal(timeseries.length, 2);
    });
  });

  // -------------------------------------------------------------
  // 3. INTERNAL MICROSERVICE SYNC (6 Endpoints Flow)
  // -------------------------------------------------------------
  describe("Internal AI Microservice Synchronization", () => {
    it("should initialize room, start speech streaming, and sync metadata", async () => {
      const session = await candidateUseCases.createSession({
        userId: candidateId,
        domain: "Physics Pedagogy",
      });

      const initialized = await internalUseCases.initializeSession({
        sessionId: session.id,
        livekitRoomSid: "RM_LIVEKIT_999",
        meta: { sampleRate: 48000 },
      });
      assert.equal(initialized.livekitRoomSid, "RM_LIVEKIT_999");

      const started = await internalUseCases.startSession({
        sessionId: session.id,
        startedAt: new Date(),
      });
      assert.equal(started.status, "IN_PROGRESS");

      const updatedMeta = await internalUseCases.updateMetadata({
        sessionId: session.id,
        meta: { latencyMs: 140, totalTokens: 1250 },
      });
      assert.equal(updatedMeta.meta.latencyMs, 140);
    });

    it("should handle candidate abandonment gracefully", async () => {
      const session = await candidateUseCases.createSession({
        userId: candidateId,
        domain: "Chemistry",
      });

      const abandoned = await internalUseCases.abandonSession({
        sessionId: session.id,
        reason: "WebRTC socket timeout after 60s of inactivity",
      });

      assert.equal(abandoned.status, "ABANDONED");

      const auditLogs = await adminUseCases.getSessionAudit(session.id);
      assert.ok(auditLogs.some((l) => l.action === "INTERNAL_SESSION_ABANDONED"));
    });
  });
});
