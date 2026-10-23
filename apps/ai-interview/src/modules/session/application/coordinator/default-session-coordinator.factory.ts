import {
  ISessionCoordinatorFactory,
  CreateSessionParams,
} from "../../domain/ports/session-coordinator-factory.port";
import { IInterviewSession } from "../../domain/ports/interview-session.port";
import { InterviewSessionCoordinator } from "./interview-session.coordinator";

export class DefaultSessionCoordinatorFactory implements ISessionCoordinatorFactory {
  createCoordinator(params: CreateSessionParams): IInterviewSession {
    return new InterviewSessionCoordinator({
      sessionId: params.sessionId,
      candidate: params.auth.candidate,
      domain: params.auth.domain,
      difficulty: params.auth.difficulty,
      systemPrompt: params.auth.systemPrompt,
      totalQuestions: params.auth.totalQuestions,
      topics: params.auth.topics,
      voiceId: params.auth.voiceId,
      ws: params.ws,
      sttService: params.sttService,
      ttsService: params.ttsService,
      syncService: params.syncService,
      storageService: params.storageService,
    });
  }
}
