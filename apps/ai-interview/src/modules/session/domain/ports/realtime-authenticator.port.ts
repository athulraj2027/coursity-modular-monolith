import { CandidateContext, InterviewDifficulty } from "../../../../shared/types/common.types";

export interface AuthenticatedSessionPayload {
  userId: string;
  candidateName: string;
  candidate: CandidateContext;
  domain: string;
  difficulty: InterviewDifficulty;
  systemPrompt?: string | null;
  totalQuestions: number;
  topics?: string[];
  voiceId?: string;
}

export interface IRealtimeAuthenticator {
  authenticate(token: string, sessionId: string): Promise<AuthenticatedSessionPayload>;
}
