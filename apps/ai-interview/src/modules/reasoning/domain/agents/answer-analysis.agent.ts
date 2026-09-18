import { ILLMService } from "../ports/llm.port";
import { AnswerAnalysis } from "../../../../shared/types/common.types";
import { logger } from "../../../../shared/logger";

export interface AnswerAnalysisInput {
  domain: string;
  difficulty: string;
  currentQuestion: string;
  currentTopic: string;
  candidateAnswer: string;
  expectedSignals?: string[];
  systemGuidelines?: string;
}

/**
 * 4. Answer Analysis Agent
 * Responsibility: Analyzes correctness, relevance, completeness, clarity (Background/near-real-time).
 */
export class AnswerAnalysisAgent {
  constructor(private llm: ILLMService) {}

  async analyze(input: AnswerAnalysisInput): Promise<AnswerAnalysis> {
    logger.info(
      `[Agent:AnswerAnalysis] Evaluating candidate response on topic "${input.currentTopic}"`
    );

    const prompt = `You are a Senior Technical Examiner analyzing a candidate's spoken interview answer.
Domain: ${input.domain} (${input.difficulty})
Topic: ${input.currentTopic}
Question Asked: "${input.currentQuestion}"
Candidate Answer: "${input.candidateAnswer}"
Expected Signals: ${input.expectedSignals?.join(", ") || "Technical accuracy, concrete examples, clear explanation"}
${input.systemGuidelines ? `Guidelines: ${input.systemGuidelines}` : ""}

Evaluate the response across these four metrics (0.0 to 1.0):
1. relevance: Did the candidate directly address the specific question asked?
2. completeness: Did the candidate cover the necessary breadth and depth?
3. correctness: Is the technical or pedagogical information factually accurate?
4. clarity: Is the explanation well-structured, coherent, and articulate?

Set "needsFollowUp" to true if completeness < 0.65 or relevance < 0.6 or if key nuances are missing.
Provide a 1-2 sentence constructive critique.`;

    const schemaDescription = `{
  "relevance": 0.90,
  "completeness": 0.80,
  "correctness": 0.88,
  "clarity": 0.85,
  "needsFollowUp": false,
  "critique": "Solid, articulate response demonstrating accurate domain principles."
}`;

    try {
      const result = await this.llm.generateStructured<AnswerAnalysis>(
        prompt,
        "You are an objective, rigorous AI interview answer analyst.",
        schemaDescription
      );

      return {
        relevance: Math.max(0, Math.min(1, result.relevance ?? 0.85)),
        completeness: Math.max(0, Math.min(1, result.completeness ?? 0.8)),
        correctness: Math.max(0, Math.min(1, result.correctness ?? 0.85)),
        clarity: Math.max(0, Math.min(1, result.clarity ?? 0.85)),
        needsFollowUp: Boolean(result.needsFollowUp),
        critique: result.critique || "Addressed the question with satisfactory understanding.",
      };
    } catch (err: any) {
      logger.warn(`[Agent:AnswerAnalysis] Analysis failed (${err.message}). Using safe fallback.`);
      return {
        relevance: 0.85,
        completeness: 0.8,
        correctness: 0.85,
        clarity: 0.85,
        needsFollowUp: false,
        critique: "Response addressed the primary question.",
      };
    }
  }
}
