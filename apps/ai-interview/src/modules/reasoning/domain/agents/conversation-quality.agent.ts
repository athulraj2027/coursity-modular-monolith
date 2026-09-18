import { ILLMService } from "../ports/llm.port";
import { ConversationQualitySignal } from "../../../../shared/types/common.types";
import { logger } from "../../../../shared/logger";

export interface QualityAnalysisInput {
  question: string;
  candidateAnswer: string;
}

/**
 * 8. Conversation Quality Agent
 * Responsibility: Detects short/rambling/off-topic/misunderstood answers (Background).
 */
export class ConversationQualityAgent {
  constructor(private llm: ILLMService) {}

  async evaluateQuality(input: QualityAnalysisInput): Promise<ConversationQualitySignal> {
    logger.info(
      `[Agent:ConversationQuality] Assessing conversation quality and delivery characteristics`
    );

    const wordCount = input.candidateAnswer.trim().split(/\s+/).length;

    // Fast deterministic rule checks
    const isTooBrief = wordCount < 6;
    const isRambling = wordCount > 250;

    const prompt = `You are a Communication and Discourse Quality Analyst for formal technical interviews.
Question Asked: "${input.question}"
Candidate Answer: "${input.candidateAnswer}"

Analyze the conversational quality:
1. isRambling: Is the response excessively long-winded, circular, or disorganized?
2. isTooBrief: Is the response a one-word or insufficient answer that fails to provide conversational substance?
3. isOffTopic: Did the candidate answer a completely different question or deflect?
4. isMisunderstood: Did the candidate misinterpret the core intent of the question?
5. sentiment: What is the tone? ("CONFIDENT" | "NEUTRAL" | "HESITANT" | "DEFENSIVE")
6. qualityScore: Overall quality of communication delivery (0.0 to 1.0).`;

    const schemaDescription = `{
  "isRambling": false,
  "isTooBrief": false,
  "isOffTopic": false,
  "isMisunderstood": false,
  "sentiment": "CONFIDENT",
  "qualityScore": 0.90
}`;

    try {
      const result = await this.llm.generateStructured<ConversationQualitySignal>(
        prompt,
        "You are an expert conversation quality analyst.",
        schemaDescription
      );

      return {
        isRambling: result.isRambling ?? isRambling,
        isTooBrief: result.isTooBrief ?? isTooBrief,
        isOffTopic: Boolean(result.isOffTopic),
        isMisunderstood: Boolean(result.isMisunderstood),
        sentiment: result.sentiment || "NEUTRAL",
        qualityScore: Math.max(0, Math.min(1, result.qualityScore ?? 0.85)),
      };
    } catch (err: any) {
      logger.warn(`[Agent:ConversationQuality] Evaluation failed (${err.message}). Using heuristics.`);
      return {
        isRambling,
        isTooBrief,
        isOffTopic: false,
        isMisunderstood: false,
        sentiment: "NEUTRAL",
        qualityScore: isTooBrief ? 0.4 : isRambling ? 0.6 : 0.85,
      };
    }
  }
}
