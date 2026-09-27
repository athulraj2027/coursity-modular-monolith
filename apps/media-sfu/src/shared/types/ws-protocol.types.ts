import type {
  RtpCapabilities,
  RtpParameters,
  DtlsParameters,
  IceCandidate,
  IceParameters,
  SctpParameters,
  MediaKind,
} from "mediasoup/node/lib/types";

export type Role = "TEACHER" | "STUDENT" | "ADMIN" | "GUEST";

export interface JoinTicketPayload {
  userId: string;
  classSessionId: string;
  role: Role;
  displayName?: string;
  canProduceAudio: boolean;
  canProduceVideo: boolean;
  canProduceScreen: boolean;
  canConsume: boolean;
  assignedNodeId: string;
  exp: number;
}

export type TransportDirection = "send" | "recv";

// Client Request Messages
export type ClientMessageType =
  | "session:join"
  | "transport:create"
  | "transport:connect"
  | "media:produce"
  | "media:consume"
  | "media:resumeConsumer"
  | "media:closeProducer"
  | "media:pauseProducer"
  | "media:resumeProducer"
  | "session:leave"
  | "ping";

export interface WsRequest<T = unknown> {
  id: string; // Correlation ID for request-response pairing
  type: ClientMessageType;
  data: T;
}

export interface WsResponse<T = unknown> {
  id: string;
  type: "response";
  ok: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface WsNotification<T = unknown> {
  type: string;
  data: T;
}

// Request Data Types
export interface JoinSessionRequestData {
  joinToken: string;
  rtpCapabilities: RtpCapabilities;
}

export interface CreateTransportRequestData {
  direction: TransportDirection;
}

export interface ConnectTransportRequestData {
  transportId: string;
  dtlsParameters: DtlsParameters;
}

export interface ProduceMediaRequestData {
  transportId: string;
  kind: MediaKind;
  rtpParameters: RtpParameters;
  appData?: Record<string, unknown>;
}

export interface ConsumeMediaRequestData {
  transportId: string;
  producerId: string;
  rtpCapabilities: RtpCapabilities;
}

export interface ResumeConsumerRequestData {
  consumerId: string;
}

export interface CloseProducerRequestData {
  producerId: string;
}

// Response Data Types
export interface JoinSessionResponseData {
  routerRtpCapabilities: RtpCapabilities;
  activeProducers: Array<{
    producerId: string;
    producerUserId: string;
    kind: MediaKind;
    appData?: Record<string, unknown>;
  }>;
  participants: Array<{
    userId: string;
    role: Role;
    displayName?: string;
  }>;
}

export interface CreateTransportResponseData {
  id: string;
  iceParameters: IceParameters;
  iceCandidates: IceCandidate[];
  dtlsParameters: DtlsParameters;
  sctpParameters?: SctpParameters;
}

export interface ProduceMediaResponseData {
  producerId: string;
}

export interface ConsumeMediaResponseData {
  consumerId: string;
  producerId: string;
  kind: MediaKind;
  rtpParameters: RtpParameters;
}
