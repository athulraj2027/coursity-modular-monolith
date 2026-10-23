export interface InboundSessionMessage {
  type: string;
  audioBase64?: string;
  text?: string;
  [key: string]: any;
}

export interface IInterviewSession {
  readonly sessionId: string;
  start(): Promise<void>;
  handleInboundMessage(msg: InboundSessionMessage): Promise<void>;
  handleClientDisconnect(): Promise<void>;
  finalizeEvaluation(): Promise<void>;
}
