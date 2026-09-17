import { ILLMService } from "../ports/llm.port";
import {
  QuestionDecision,
  InterviewDifficulty,
  CandidateContext,
} from "../../../../shared/types/common.types";
import { logger } from "../../../../shared/logger";

export interface QuestionGenerationInput {
  domain: string;
  difficulty: InterviewDifficulty;
  candidate: CandidateContext;
  currentTopic: string;
  coveredTopics: string[];
  previousQuestions: string[];
  systemGuidelines?: string;
  performanceTrend?: "STRONG" | "MODERATE" | "STRUGGLING";
}

/**
 * 3. Question Generation Agent
 * Responsibility: Generates context-aware questions (Real-time).
 */
export class QuestionGenerationAgent {
  constructor(private llm: ILLMService) {}

  async generateQuestion(input: QuestionGenerationInput): Promise<QuestionDecision> {
    logger.info(
      `[Agent:QuestionGen] Generating question on topic "${input.currentTopic}" (Difficulty: ${input.difficulty}, Trend: ${input.performanceTrend || "NORMAL"})`
    );

    const prevList =
      input.previousQuestions.length > 0
        ? input.previousQuestions.map((q, i) => `${i + 1}. "${q}"`).join("\n")
        : "None yet.";

    const prompt = `You are "Aura", Coursity's expert AI Interviewer crafting the next interview question for ${input.candidate.name}.
Target Domain: ${input.domain}
Current Topic: ${input.currentTopic}
Assigned Difficulty Level: ${input.difficulty}
Candidate Background Context:
- Bio: ${input.candidate.bio || "N/A"}
- Experience: ${input.candidate.experienceYears ?? "Not specified"} years
- Declared Expertise: ${input.candidate.expertise?.join(", ") || "General"}
- Performance Trend: ${input.performanceTrend || "MODERATE"}
Previously Asked Questions (DO NOT DUPLICATE):
${prevList}
${input.systemGuidelines ? `Guidelines: ${input.systemGuidelines}` : ""}

Rules:
1. Ask ONE clear, concise spoken question (1-2 sentences).
2. Reference the candidate's real-world teaching or technical domain context naturally where appropriate.
3. If performance trend is "STRONG", calibrate toward deeper edge cases or system trade-offs.
4. If performance trend is "STRUGGLING", ask a foundational diagnostic application question.
5. Provide expected signals and rationale for evaluation.`;

    const schemaDescription = `{
  "question": "Could you walk me through how you design and implement asynchronous event-driven workflows in a backend service?",
  "topic": "${input.currentTopic}",
  "difficulty": "${input.difficulty}",
  "expectedSignals": ["event loop", "message queues", "backpressure", "idempotency"],
  "rationale": "Testing practical understanding of asynchronous architecture and concurrency primitives."
}`;

    try {
      return await this.llm.generateStructured<QuestionDecision>(
        prompt,
        "You are an expert technical interviewer crafting concise, high-signal questions.",
        schemaDescription
      );
    } catch (err: any) {
      logger.warn(`[Agent:QuestionGen] LLM generation failed (${err.message}). Using fallback question.`);
      return {
        question: `How do you apply best practices and solve core challenges when working with ${input.currentTopic}?`,
        topic: input.currentTopic,
        difficulty: input.difficulty,
        expectedSignals: ["fundamentals", "problem solving", "best practices"],
        rationale: "Baseline assessment question.",
      };
    }
  }
}
