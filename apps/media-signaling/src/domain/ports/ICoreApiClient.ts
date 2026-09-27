import { Role } from "@/shared/types/ws-signaling.types";
import { ParticipantPermissions } from "../entities/SignalingSession";

export interface SessionAccessResult {
  allowed: boolean;
  userId: string;
  classSessionId: string;
  role: Role;
  displayName?: string;
  permissions: ParticipantPermissions;
}

export interface ICoreApiClient {
  verifySessionAccess(classSessionId: string, userToken: string): Promise<SessionAccessResult>;
}
