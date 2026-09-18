import { env } from "@/lib/env";
import type {
  InboundSocketMessage,
  ConnectionState,
  NetworkQuality,
  InboundTranscriptMessage,
  InboundEvaluationReportMessage,
} from "../types/interview.types";

export interface InterviewSocketCallbacks {
  onConnectionStateChange?: (state: ConnectionState) => void;
  onNetworkQualityChange?: (quality: NetworkQuality) => void;
  onAuthSuccess?: (data: { sessionId: string; userId: string; candidateName: string }) => void;
  onTranscript?: (msg: InboundTranscriptMessage) => void;
  onSpeakingStart?: (content?: string) => void;
  onSpeakingEnd?: () => void;
  onAudioChunk?: (base64Pcm: string) => void;
  onAnswerAnalysis?: (analysis: any) => void;
  onInterruptionAck?: () => void;
  onSessionState?: (phase: string) => void;
  onEvaluationReport?: (report: InboundEvaluationReportMessage["report"]) => void;
  onError?: (error: string) => void;
}

export class InterviewSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private token: string;
  private sessionId: string;
  private callbacks: InterviewSocketCallbacks;

  private connectionState: ConnectionState = "DISCONNECTED";
  private retryCount: number = 0;
  private maxRetries: number = 5;
  private reconnectTimeout: number | null = null;
  private isIntentionallyClosed: boolean = false;
  private pingInterval: number | null = null;

  constructor(
    token: string,
    sessionId: string,
    callbacks: InterviewSocketCallbacks,
    customWsUrl?: string
  ) {
    this.token = token;
    this.sessionId = sessionId;
    this.callbacks = callbacks;
    this.url = customWsUrl || env.VITE_AI_INTERVIEW_WS_URL || "ws://localhost:4000/interview";
  }

  connect(): void {
    this.isIntentionallyClosed = false;
    this.setConnectionState("CONNECTING");

    try {
      const connectUrl = new URL(this.url);
      connectUrl.searchParams.set("token", this.token);
      connectUrl.searchParams.set("sessionId", this.sessionId);

      this.ws = new WebSocket(connectUrl.toString());
      this.ws.binaryType = "arraybuffer";

      this.ws.onopen = () => {
        this.retryCount = 0;
        this.setConnectionState("CONNECTED");
        this.callbacks.onNetworkQualityChange?.("EXCELLENT");
        this.startHeartbeat();
      };

      this.ws.onmessage = (event: MessageEvent) => {
        try {
          if (typeof event.data === "string") {
            const msg: InboundSocketMessage = JSON.parse(event.data);
            this.handleMessage(msg);
          } else if (event.data instanceof ArrayBuffer) {
            // Binary audio chunk (if sent as binary)
            const bytes = new Uint8Array(event.data);
            let binary = "";
            for (let i = 0; i < bytes.byteLength; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
            const base64 = window.btoa(binary);
            this.callbacks.onAudioChunk?.(base64);
          }
        } catch (err) {
          console.error("[InterviewSocket] Error parsing message:", err);
        }
      };

      this.ws.onerror = (err) => {
        console.error("[InterviewSocket] WebSocket error:", err);
        this.callbacks.onNetworkQualityChange?.("UNSTABLE");
      };

      this.ws.onclose = (event) => {
        this.stopHeartbeat();
        if (this.isIntentionallyClosed) {
          this.setConnectionState("DISCONNECTED");
        } else {
          this.handleReconnection(event.reason || "Connection dropped");
        }
      };
    } catch (err: any) {
      console.error("[InterviewSocket] Connection initialization error:", err);
      this.setConnectionState("ERROR");
      this.callbacks.onError?.(err.message || "Failed to initialize WebSocket");
    }
  }

  private handleMessage(msg: InboundSocketMessage): void {
    switch (msg.type) {
      case "AUTH_SUCCESS":
        this.callbacks.onAuthSuccess?.(msg.meta);
        break;

      case "AUTH_ERROR":
      case "ERROR":
        this.callbacks.onError?.(msg.error);
        break;

      case "TRANSCRIPT_FINAL":
        this.callbacks.onTranscript?.(msg);
        break;

      case "AI_SPEAKING_START":
        this.callbacks.onSpeakingStart?.(msg.content);
        break;

      case "AI_SPEAKING_END":
        this.callbacks.onSpeakingEnd?.();
        break;

      case "AI_AUDIO_CHUNK":
        this.callbacks.onAudioChunk?.(msg.audioBase64);
        break;

      case "ANSWER_ANALYSIS":
        this.callbacks.onAnswerAnalysis?.(msg);
        break;

      case "INTERRUPTION_ACK":
        this.callbacks.onInterruptionAck?.();
        break;

      case "SESSION_STATE":
        this.callbacks.onSessionState?.(msg.phase);
        break;

      case "EVALUATION_REPORT":
        this.callbacks.onEvaluationReport?.(msg.report);
        break;

      default:
        break;
    }
  }

  private handleReconnection(reason: string): void {
    if (this.retryCount >= this.maxRetries) {
      this.setConnectionState("ERROR");
      this.callbacks.onNetworkQualityChange?.("OFFLINE");
      this.callbacks.onError?.(`Connection lost. Maximum reconnection attempts reached: ${reason}`);
      return;
    }

    this.retryCount++;
    this.setConnectionState("RECONNECTING");
    this.callbacks.onNetworkQualityChange?.("UNSTABLE");

    // Exponential backoff with jitter: 1s, 2s, 4s, 8s...
    const baseDelay = Math.min(1000 * Math.pow(2, this.retryCount - 1), 8000);
    const jitter = Math.random() * 500;
    const delay = baseDelay + jitter;

    console.warn(`[InterviewSocket] Reconnecting attempt ${this.retryCount}/${this.maxRetries} in ${Math.round(delay)}ms...`);

    this.reconnectTimeout = window.setTimeout(() => {
      this.connect();
    }, delay);
  }

  sendAudioChunk(pcmChunk: ArrayBuffer): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(pcmChunk);
    }
  }

  sendTextInput(text: string): void {
    this.sendJson({
      type: "TEXT_INPUT",
      text,
    });
  }

  sendInterrupt(): void {
    this.sendJson({
      type: "INTERRUPT",
    });
  }

  sendCompleteSession(): void {
    this.sendJson({
      type: "COMPLETE_SESSION",
    });
  }

  private sendJson(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  private setConnectionState(state: ConnectionState): void {
    if (this.connectionState !== state) {
      this.connectionState = state;
      this.callbacks.onConnectionStateChange?.(state);
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.pingInterval = window.setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        // Keep-alive message
        this.sendJson({ type: "PING" });
      }
    }, 15000);
  }

  private stopHeartbeat(): void {
    if (this.pingInterval !== null) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  close(): void {
    this.isIntentionallyClosed = true;
    this.stopHeartbeat();
    if (this.reconnectTimeout !== null) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) {
      try {
        this.ws.close();
      } catch {}
      this.ws = null;
    }
    this.setConnectionState("DISCONNECTED");
  }
}
