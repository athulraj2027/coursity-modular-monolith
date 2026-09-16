import { InterviewDifficulty, InterviewType } from "../entities/interview.entity";

export interface CreateInterviewSessionDto {
  userId: string;
  templateId?: string;
  type?: InterviewType;
  domain?: string;
  difficulty?: InterviewDifficulty;
}

export interface CandidateListSessionsQueryDto {
  userId: string;
  page?: number;
  limit?: number;
  type?: InterviewType;
  status?: string;
}

export interface RealtimeTokenDto {
  sessionId: string;
  userId: string;
  userName: string;
  roomName: string;
  participantIdentity: string;
  token: string;
  expiresIn: number;
}
