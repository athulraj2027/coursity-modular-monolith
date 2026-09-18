import { apiClient } from "@/lib/api-client";
import type {
  InterviewSession,
  InterviewTemplate,
  InterviewTranscript,
  RealtimeToken,
  InterviewReportData,
  InterviewDifficulty,
  InterviewType,
} from "../types/interview.types";

export const interviewApi = {
  // 1. Templates
  getTemplates: async (filters?: { domain?: string; difficulty?: string; type?: string }) => {
    const params = new URLSearchParams();
    if (filters?.domain) params.set("domain", filters.domain);
    if (filters?.difficulty) params.set("difficulty", filters.difficulty);
    if (filters?.type) params.set("type", filters.type);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return await apiClient<{ success: boolean; data: InterviewTemplate[] }>(`/interviews/templates${qs}`, {
      method: "GET",
    });
  },

  getTemplateBySlug: async (slug: string) => {
    return await apiClient<{ success: boolean; data: InterviewTemplate }>(`/interviews/templates/${slug}`, {
      method: "GET",
    });
  },

  // 2. Candidate Session Lifecycle
  createSession: async (data: {
    templateId?: string;
    type?: InterviewType;
    domain?: string;
    difficulty?: InterviewDifficulty;
  }) => {
    return await apiClient<{ success: boolean; message: string; data: InterviewSession }>("/interviews/sessions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getSession: async (id: string) => {
    return await apiClient<{ success: boolean; data: InterviewSession }>(`/interviews/sessions/${id}`, {
      method: "GET",
    });
  },

  startSession: async (id: string) => {
    return await apiClient<{ success: boolean; message: string; data: InterviewSession }>(
      `/interviews/sessions/${id}/start`,
      {
        method: "POST",
      }
    );
  },

  getRealtimeToken: async (id: string) => {
    return await apiClient<{ success: boolean; data: RealtimeToken }>(
      `/interviews/sessions/${id}/realtime-token`,
      {
        method: "POST",
      }
    );
  },

  // 3. Transcripts
  getTranscripts: async (id: string) => {
    return await apiClient<{ success: boolean; data: InterviewTranscript[] }>(
      `/interviews/sessions/${id}/transcripts`,
      {
        method: "GET",
      }
    );
  },

  getLatestTranscripts: async (id: string, limit: number = 5) => {
    return await apiClient<{ success: boolean; data: InterviewTranscript[] }>(
      `/interviews/sessions/${id}/transcripts/latest?limit=${limit}`,
      {
        method: "GET",
      }
    );
  },

  // 4. Session Completion / Cancellation
  completeSession: async (id: string) => {
    return await apiClient<{ success: boolean; message: string; data: InterviewSession }>(
      `/interviews/sessions/${id}/complete`,
      {
        method: "POST",
      }
    );
  },

  cancelSession: async (id: string, reason?: string) => {
    return await apiClient<{ success: boolean; message: string; data: InterviewSession }>(
      `/interviews/sessions/${id}/cancel`,
      {
        method: "POST",
        body: JSON.stringify({ reason }),
      }
    );
  },

  // 5. Reports & Recordings
  getReport: async (id: string) => {
    return await apiClient<{ success: boolean; data: InterviewReportData }>(
      `/interviews/sessions/${id}/report`,
      {
        method: "GET",
      }
    );
  },

  getRecording: async (id: string) => {
    return await apiClient<{ success: boolean; data: { recordingUrl: string | null } }>(
      `/interviews/sessions/${id}/recording`,
      {
        method: "GET",
      }
    );
  },

  // 6. My Interviews List
  getMyInterviews: async (filters?: { page?: number; limit?: number; type?: string; status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.page) params.set("page", String(filters.page));
    if (filters?.limit) params.set("limit", String(filters.limit));
    if (filters?.type) params.set("type", filters.type);
    if (filters?.status) params.set("status", filters.status);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return await apiClient<{
      success: boolean;
      data: InterviewSession[];
      meta: { total: number; page: number; limit: number; totalPages: number };
    }>(`/interviews/my-interviews${qs}`, {
      method: "GET",
    });
  },
};
