import { WebSocket } from "ws";
import { IInterviewSession } from "./interview-session.port";
import { AuthenticatedSessionPayload } from "./realtime-authenticator.port";
import { ISTTService } from "./stt.port";
import { ITTSService } from "./tts.port";
import { IBackendSyncService } from "./backend-sync.port";
import { IAudioStorageService } from "./audio-storage.port";

export interface CreateSessionParams {
  sessionId: string;
  auth: AuthenticatedSessionPayload;
  ws: WebSocket;
  sttService: ISTTService;
  ttsService: ITTSService;
  syncService: IBackendSyncService;
  storageService: IAudioStorageService;
}

export interface ISessionCoordinatorFactory {
  createCoordinator(params: CreateSessionParams): IInterviewSession;
}
