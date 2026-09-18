import { IBackendSyncService } from "../../domain/ports/backend-sync.port";
import { CriterionScoreResult } from "../../../../shared/types/common.types";
import { env } from "../../../../shared/config/env.config";
import { logger } from "../../../../shared/logger";

export class HttpBackendSyncService implements IBackendSyncService {
  private readonly baseUrl: string;
  private readonly secret: string;

  constructor() {
    this.baseUrl = env.HTTP_BACKEND_URL;
    this.secret = env.INTERNAL_SERVICE_SECRET;
  }

  private async request(path: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${path}`;
    const headers = {
      "Content-Type": "application/json",
      "x-internal-secret": this.secret,
      ...(options.headers || {}),
    };

    try {
      const res = await fetch(url, { ...options, headers });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        logger.error(`[BackendSync] Request to ${path} failed: ${res.status}`, data);
        throw new Error(data.message || `Backend sync failed with status ${res.status}`);
      }
      return data;
    } catch (err: any) {
      logger.error(`[BackendSync] Network error on ${path}:`, err.message);
      throw err;
    }
  }

  async initializeSession(sessionId: string, livekitRoomSid?: string, meta?: any) {
    return this.request(`/internal/interviews/sessions/${sessionId}/initialize`, {
      method: "POST",
      body: JSON.stringify({ livekitRoomSid, meta }),
    });
  }

  async startSession(sessionId: string, startedAt?: Date, meta?: any) {
    return this.request(`/internal/interviews/sessions/${sessionId}/start`, {
      method: "POST",
      body: JSON.stringify({
        startedAt: (startedAt || new Date()).toISOString(),
        meta,
      }),
    });
  }

  async appendTranscript(data: {
    sessionId: string;
    role: "SYSTEM" | "ASSISTANT" | "CANDIDATE";
    content: string;
    audioUrl?: string;
    sequenceOrder?: number;
    durationMs?: number;
    sentiment?: string;
    turnFeedback?: string;
  }) {
    return this.request(`/internal/interviews/sessions/${data.sessionId}/transcripts`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateMetadata(sessionId: string, data: { livekitRoomSid?: string; recordingUrl?: string; meta?: any }) {
    return this.request(`/internal/interviews/sessions/${sessionId}/metadata`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async endSession(data: {
    sessionId: string;
    endedAt?: Date;
    durationSeconds?: number;
    overallScore: number;
    outcome?: "PASSED" | "FAILED" | "NEEDS_HUMAN_REVIEW";
    summaryFeedback: string;
    strengths?: string[];
    improvements?: string[];
    recordingUrl?: string;
    criteriaScores?: CriterionScoreResult[];
    meta?: any;
  }) {
    return this.request(`/internal/interviews/sessions/${data.sessionId}/end`, {
      method: "POST",
      body: JSON.stringify({
        ...data,
        endedAt: (data.endedAt || new Date()).toISOString(),
      }),
    });
  }

  async abandonSession(sessionId: string, reason?: string) {
    return this.request(`/internal/interviews/sessions/${sessionId}/abandon`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  }
}
