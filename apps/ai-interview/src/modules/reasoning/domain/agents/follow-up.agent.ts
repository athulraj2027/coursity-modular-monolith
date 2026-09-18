import { ILLMService } from "../ports/llm.port";
import {
  FollowUpDecision,
  AnswerAnalysis,
  ExtractedEvidence,
} from "../../../../shared/types/common.types";
import { logger } from "../../../../shared/logger";

export interface FollowUpAgentInput {
  domain: string;
  currentQuestion: string;
  currentTopic: string;
  candidateAnswer: string;
  analysis: AnswerAnalysis;
  evidence?: ExtractedEvidence;
  systemGuidelines?: string;
}

/**
 * 6. Follow-up Agent
 * Responsibility: Generates targeted probing questions based on gaps (Real-time).
 */
export class FollowUpAgent {
  constructor(private llm: ILLMService) {}

  async generateFollowUp(input: FollowUpAgentInput): Promise<FollowUpDecision> {
    logger.info(
      `[Agent:FollowUp] Evaluating follow-up probing need for topic "${input.currentTopic}"`
    );

    const missing = input.evidence?.missingEvidence?.length
      ? input.evidence.missingEvidence.join(", ")
      : "practical implementation details";

    const prompt = `You are "Aura", Coursity's AI Interviewer evaluating whether a quick follow-up probe is needed.
Domain: ${input.domain}
Current Topic: ${input.currentTopic}
Question Asked: "${input.currentQuestion}"
Candidate Answer: "${input.candidateAnswer}"
Answer Evaluation:
- Relevance: ${input.analysis.relevance}
- Completeness: ${input.analysis.completeness}
- Correctness: ${input.analysis.correctness}
- Missing Evidence Identified: ${missing}
- Critique: ${input.analysis.critique}
${input.systemGuidelines ? `Guidelines: ${input.systemGuidelines}` : ""}

Objective:
If the candidate's answer lacks concrete implementation details, gave generic buzzwords, or skipped a key nuance, generate ONE natural follow-up question asking for a specific example or deeper clarification.
Do NOT reveal the answer or explain the solution.
Keep the question under 2 sentences.`;

    const schemaDescription = `{
  "shouldFollowUp": true,
  "reason": "Candidate mentioned the concept generally without illustrating practical application.",
  "question": "Could you walk me through a specific scenario where you implemented that and what trade-offs you encountered?"
}`;

    try {
      const decision = await this.llm.generateStructured<FollowUpDecision>(
        prompt,
        "You are an expert AI interviewer generating adaptive follow-up questions.",
        schemaDescription
      );

      return {
        shouldFollowUp: decision.shouldFollowUp ?? input.analysis.needsFollowUp,
        reason: decision.reason || "Clarifying details on the previous point.",
        question:
          decision.question ||
          "Could you give a concrete example of how you applied that in practice?",
        targetMissingEvidence: input.evidence?.missingEvidence,
      };
    } catch (err: any) {
      logger.warn(`[Agent:FollowUp] Generation failed (${err.message}). Using safe probe.`);
      return {
        shouldFollowUp: input.analysis.needsFollowUp,
        reason: "Probing for more concrete detail.",
        question: "Could you elaborate on how that works under real-world constraints?",
      };
    }
  }
}
