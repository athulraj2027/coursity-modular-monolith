import {
  DialogueMessage,
  AnswerAnalysis,
  ExtractedEvidence,
  ConversationQualitySignal,
  IntegrityAnomalySignal,
} from "../../../../shared/types/common.types";
import { InterviewSummary } from "./interview-summary";

export class InterviewMemory {
  private conversation: DialogueMessage[] = [];
  private analyses: AnswerAnalysis[] = [];
  public summary: InterviewSummary = new InterviewSummary();

  addMessage(
    role: "system" | "ai" | "candidate",
    content: string,
    metadata?: {
      analysis?: AnswerAnalysis;
      evidence?: ExtractedEvidence;
      quality?: ConversationQualitySignal;
      anomaly?: IntegrityAnomalySignal;
    }
  ): DialogueMessage {
    const msg: DialogueMessage = {
      role,
      content,
      timestamp: new Date(),
      analysis: metadata?.analysis,
      evidence: metadata?.evidence,
      quality: metadata?.quality,
      anomaly: metadata?.anomaly,
    };
    this.conversation.push(msg);

    if (metadata?.analysis) {
      this.analyses.push(metadata.analysis);
    }
    if (metadata?.evidence) {
      if (metadata.evidence.technicalClaims) {
        metadata.evidence.technicalClaims.forEach((c) => this.summary.addClaim(c));
      }
      if (metadata.evidence.missingEvidence) {
        metadata.evidence.missingEvidence.forEach((m) => this.summary.addUnresolvedArea(m));
      }
    }
    if (metadata?.anomaly?.anomalyDetected) {
      this.summary.addAnomaly(`[${metadata.anomaly.severity}] ${metadata.anomaly.reason}`);
    }

    return msg;
  }

  getConversation(): ReadonlyArray<DialogueMessage> {
    return this.conversation;
  }

  getAnalyses(): ReadonlyArray<AnswerAnalysis> {
    return this.analyses;
  }

  clear(): void {
    this.conversation = [];
    this.analyses = [];
    this.summary = new InterviewSummary();
  }
}
