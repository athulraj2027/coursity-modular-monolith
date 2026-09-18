import { WebSocket } from "ws";
import { VadService } from "../../infrastructure/audio/vad.service";
import { AudioRecorderService } from "../../infrastructure/audio/audio-recorder.service";
import { ISTTService } from "../../domain/ports/stt.port";
import { ITTSService } from "../../domain/ports/tts.port";
import { IBackendSyncService } from "../../domain/ports/backend-sync.port";
import { IAudioStorageService } from "../../domain/ports/audio-storage.port";
import { InterviewLangGraph } from "../../../reasoning/infrastructure/graph/interview-langgraph";
import { InterviewGraphStateType } from "../../../reasoning/infrastructure/graph/state-annotations";
import {
  CandidateContext,
  InterviewDifficulty,
  InterviewPhase,
} from "../../../../shared/types/common.types";
import { logger } from "../../../../shared/logger";

export interface SessionCoordinatorOptions {
  sessionId: string;
  candidate: CandidateContext;
  domain: string;
  difficulty?: InterviewDifficulty;
  systemPrompt?: string | null;
  totalQuestions?: number;
  maxQuestions?: number;
  topics?: string[];
  voiceId?: string;
  ws: WebSocket;
  sttService: ISTTService;
  ttsService: ITTSService;
  syncService: IBackendSyncService;
  storageService: IAudioStorageService;
}

export class InterviewSessionCoordinator {
  public readonly sessionId: string;
  public readonly candidate: CandidateContext;
  public readonly domain: string;
  public readonly difficulty: InterviewDifficulty;
  private readonly systemPrompt: string | null;
  private readonly totalQuestions: number;
  private readonly topics: string[];
  private readonly voiceId?: string;

  private ws: WebSocket;
  private vad: VadService;
  private sessionRecorder: AudioRecorderService;
  private turnRecorder: AudioRecorderService;
  private stt: ISTTService;
  private tts: ITTSService;
  private sync: IBackendSyncService;
  private storage: IAudioStorageService;
  private graph: InterviewLangGraph;

  private graphState: Partial<InterviewGraphStateType>;
  private isAiSpeaking: boolean = false;
  private isProcessingTurn: boolean = false;
  private isFinalized: boolean = false;
  private sequenceOrder: number = 0;
  private startedAt: Date | null = null;

  constructor(opts: SessionCoordinatorOptions) {
    this.sessionId = opts.sessionId;
    this.candidate = opts.candidate;
    this.domain = opts.domain;
    this.difficulty = opts.difficulty || "INTERMEDIATE";
    this.systemPrompt = opts.systemPrompt || null;
    this.totalQuestions = opts.totalQuestions || opts.maxQuestions || 5;
    this.topics = opts.topics || [
      "Core Domain Competencies",
      "Pedagogy & Problem Solving",
      "System Architecture & Scaling",
    ];
    this.voiceId = opts.voiceId;

    this.ws = opts.ws;
    this.stt = opts.sttService;
    this.tts = opts.ttsService;
    this.sync = opts.syncService;
    this.storage = opts.storageService;

    this.vad = new VadService();
    this.sessionRecorder = new AudioRecorderService();
    this.turnRecorder = new AudioRecorderService();
    this.graph = new InterviewLangGraph();

    this.graphState = {
      interviewId: this.sessionId,
      candidate: this.candidate,
      domain: this.domain,
      difficulty: this.difficulty,
      systemPrompt: this.systemPrompt,
      totalQuestions: this.totalQuestions,
      topics: this.topics,
      phase: "INITIALIZING",
      questionIndex: 0,
      coveredTopics: [],
      previousQuestions: [],
      conversation: [],
      analyses: [],
      consecutiveFollowUps: 0,
    };

    this.setupVadListeners();
  }

  private setupVadListeners(): void {
    this.vad.on("speech_start", () => {
      logger.info(`[Coordinator:${this.sessionId}] Candidate started speaking`);

      if (this.isAiSpeaking) {
        logger.info(`[Coordinator:${this.sessionId}] Interruption / Barge-in triggered!`);
        this.isAiSpeaking = false;
        this.sendJson({ type: "INTERRUPTION_ACK" });
      }
    });

    this.vad.on("speech_end", async () => {
      logger.info(`[Coordinator:${this.sessionId}] Candidate stopped speaking (processing audio)`);
      const turnPcm = this.turnRecorder.getRawPcmBuffer();
      this.turnRecorder.clear();

      if (turnPcm.length < 3200) {
        logger.info(`[Coordinator:${this.sessionId}] Audio snippet too brief (${turnPcm.length} bytes), ignoring.`);
        return;
      }

      if (this.isProcessingTurn) {
        logger.info(`[Coordinator:${this.sessionId}] Already processing turn, ignoring duplicate trigger.`);
        return;
      }

      const transcript = await this.stt.transcribeAudio(turnPcm);
      logger.info(`[Coordinator:${this.sessionId}] STT Result: "${transcript}"`);
      if (transcript && transcript.trim().length > 0) {
        await this.handleCandidateText(transcript.trim());
      }
    });
  }

  async start(): Promise<void> {
    this.startedAt = new Date();
    logger.info(`[Coordinator:${this.sessionId}] Starting interview orchestration...`);

    await this.sync.startSession(this.sessionId, this.startedAt);

    // Initial StateGraph invocation (runs Planner -> Supervisor -> Question)
    const result = await this.graph.invoke(this.graphState);
    this.graphState = { ...result };

    if (result.responseText) {
      await this.speakAndBroadcast(result.responseText, result.phase);
    }
  }

  async handleInboundMessage(msg: {
    type: string;
    audioBase64?: string;
    text?: string;
  }): Promise<void> {
    switch (msg.type) {
      case "AUDIO_CHUNK":
        if (msg.audioBase64) {
          const chunk = Buffer.from(msg.audioBase64, "base64");
          this.sessionRecorder.appendChunk(chunk);
          this.turnRecorder.appendChunk(chunk);
          this.vad.processAudioChunk(chunk);

          // If candidate is not currently speaking, keep only the latest ~400ms (12,800 bytes) as pre-roll
          if (!this.vad.getIsSpeaking()) {
            this.turnRecorder.trimToLastBytes(12800);
          }
        }
        break;

      case "TEXT_INPUT":
        if (msg.text && msg.text.trim()) {
          await this.handleCandidateText(msg.text.trim());
        }
        break;

      case "INTERRUPT":
        this.isAiSpeaking = false;
        this.sendJson({ type: "INTERRUPTION_ACK" });
        break;

      case "COMPLETE_SESSION":
        await this.finalizeEvaluation();
        break;

      default:
        break;
    }
  }

  async handleCandidateText(text: string): Promise<void> {
    if (this.isProcessingTurn || this.graphState.phase === "COMPLETED") return;
    this.isProcessingTurn = true;

    try {
      this.sequenceOrder++;
      logger.info(`[Coordinator:${this.sessionId}] Candidate Turn [${this.sequenceOrder}]: "${text}"`);

      // 1. Send candidate transcript to client
      this.sendJson({
        type: "TRANSCRIPT_FINAL",
        role: "CANDIDATE",
        content: text,
        sequenceOrder: this.sequenceOrder,
      });

      // 2. Sync transcript to core backend
      await this.sync.appendTranscript({
        sessionId: this.sessionId,
        role: "CANDIDATE",
        content: text,
        sequenceOrder: this.sequenceOrder,
      });

      // 3. Invoke LangGraph multi-agent cognitive reasoning
      const turnInput: Partial<InterviewGraphStateType> = {
        ...this.graphState,
        candidateAnswer: text,
        conversation: [
          {
            role: "candidate",
            content: text,
            timestamp: new Date(),
          },
        ],
      };

      const result = await this.graph.invoke(turnInput);
      this.graphState = { ...result };

      // 4. Send metrics & quality signals to client
      if (result.answerAnalysis) {
        this.sendJson({
          type: "ANSWER_ANALYSIS",
          analysis: result.answerAnalysis,
          evidence: result.evidence,
          quality: result.quality,
          sequenceOrder: this.sequenceOrder,
        });
      }

      // 5. Speak AI response
      if (result.responseText) {
        await this.speakAndBroadcast(result.responseText, result.phase);
      }

      // 6. Check for end of interview
      if (result.phase === "COMPLETED" || result.nextAction === "END_INTERVIEW") {
        await this.finalizeEvaluation();
      }
    } catch (err: any) {
      logger.error(`[Coordinator:${this.sessionId}] Error processing turn:`, err.message);
      this.sendJson({ type: "ERROR", error: "Failed to process turn" });
    } finally {
      this.isProcessingTurn = false;
    }
  }

  private async speakAndBroadcast(text: string, phase?: InterviewPhase): Promise<void> {
    this.sequenceOrder++;
    this.isAiSpeaking = true;
    logger.info(`[Coordinator:${this.sessionId}] AI Turn [${this.sequenceOrder}] (${phase}): "${text}"`);

    this.sendJson({
      type: "TRANSCRIPT_FINAL",
      role: "ASSISTANT",
      content: text,
      phase,
      sequenceOrder: this.sequenceOrder,
    });

    await this.sync.appendTranscript({
      sessionId: this.sessionId,
      role: "ASSISTANT",
      content: text,
      sequenceOrder: this.sequenceOrder,
    });

    this.sendSpeakingState(true, text);

    const pcmAudio = await this.tts.synthesizeSpeech(text, this.voiceId);

    if (this.isAiSpeaking && pcmAudio.length > 0) {
      this.sendAudioChunk(pcmAudio);
    }

    this.sendSpeakingState(false);
    this.isAiSpeaking = false;
  }

  async finalizeEvaluation(): Promise<void> {
    if (this.isFinalized) {
      return;
    }
    this.isFinalized = true;

    logger.info(`[Coordinator:${this.sessionId}] Finalizing interview evaluation & report...`);
    this.graphState.phase = "EVALUATING";
    this.sendJson({ type: "SESSION_STATE", phase: "EVALUATING" });

    let evaluation = this.graphState.evaluation;
    if (!evaluation) {
      const evalResult = await this.graph.invoke({
        ...this.graphState,
        nextAction: "END_INTERVIEW",
      });
      this.graphState = { ...evalResult };
      evaluation = evalResult.evaluation;
    }

    const wavBuffer = this.sessionRecorder.exportWavBuffer();
    const recordingUrl = await this.storage.uploadAudioRecording(this.sessionId, wavBuffer);

    if (evaluation) {
      await this.sync.endSession({
        sessionId: this.sessionId,
        overallScore: evaluation.overallScore,
        outcome: evaluation.outcome,
        summaryFeedback: evaluation.summaryFeedback,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
        recordingUrl,
        criteriaScores: evaluation.criteriaScores,
      });

      this.sendJson({
        type: "EVALUATION_REPORT",
        phase: "COMPLETED",
        report: {
          ...evaluation,
          recordingUrl,
        },
      });

      logger.success(`[Coordinator:${this.sessionId}] Evaluation successfully stored.`);
    }

    this.graphState.phase = "COMPLETED";
    this.sendJson({ type: "SESSION_STATE", phase: "COMPLETED" });
  }

  async handleClientDisconnect(): Promise<void> {
    if (this.graphState.phase !== "COMPLETED") {
      logger.warn(`[Coordinator:${this.sessionId}] Client disconnected prematurely.`);
      await this.sync.abandonSession(
        this.sessionId,
        "Candidate disconnected before finishing all questions."
      );
    }
  }

  private sendSpeakingState(isSpeaking: boolean, textPreview?: string): void {
    this.sendJson({
      type: isSpeaking ? "AI_SPEAKING_START" : "AI_SPEAKING_END",
      role: "ASSISTANT",
      content: textPreview,
    });
  }

  private sendAudioChunk(pcmBuffer: Buffer): void {
    this.sendJson({
      type: "AI_AUDIO_CHUNK",
      role: "ASSISTANT",
      audioBase64: pcmBuffer.toString("base64"),
    });
  }

  private sendJson(msg: any): void {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }
}
