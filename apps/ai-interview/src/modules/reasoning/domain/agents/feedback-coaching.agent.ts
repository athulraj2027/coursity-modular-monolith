import { ILLMService } from "../ports/llm.port";
import {
  CandidateFeedback,
  CandidateContext,
} from "../../../../shared/types/common.types";
import { logger } from "../../../../shared/logger";

export interface CoachingInput {
  domain: string;
  candidate: CandidateContext;
  overallScore: number;
  strengths: string[];
  improvements: string[];
}

/**
 * 11. Feedback/Coaching Agent
 * Responsibility: Generates candidate-facing strengths and improvement feedback (End/background).
 */
export class FeedbackCoachingAgent {
  constructor(private llm: ILLMService) {}

  async generateCoaching(input: CoachingInput): Promise<CandidateFeedback> {
    logger.info(
      `[Agent:FeedbackCoaching] Generating candidate-facing personalized coaching feedback for ${input.candidate.name}`
    );

    const prompt = `You are an Empathetic Senior Technical Mentor and Educator Coach.
Generate personalized, constructive feedback for candidate ${input.candidate.name} who just completed an assessment in ${input.domain}.
Performance Score: ${input.overallScore}/100
Strengths Identified: ${input.strengths.join(", ")}
Improvement Areas: ${input.improvements.join(", ")}

Generate:
1. keyStrengths: 2-3 encouraging bullet points highlighting what they did best.
2. improvementAreas: 2-3 constructive points with specific context.
3. coachingRecommendations: 2 practical pedagogical or technical learning tips.
4. actionableNextSteps: 2 immediate recommendations for their professional growth.`;

    const schemaDescription = `{
  "keyStrengths": [
    "Your explanation of core asynchronous concepts was exceptionally clear and articulate."
  ],
  "improvementAreas": [
    "When explaining system architecture, try to explicitly mention failure modes and backpressure."
  ],
  "coachingRecommendations": [
    "Practice using diagrams or live analogies when explaining distributed consensus."
  ],
  "actionableNextSteps": [
    "Review advanced microservice patterns in high-throughput environments."
  ]
}`;

    try {
      return await this.llm.generateStructured<CandidateFeedback>(
        prompt,
        "You are an encouraging, expert technical coach.",
        schemaDescription
      );
    } catch (err: any) {
      logger.warn(`[Agent:FeedbackCoaching] Generation failed (${err.message}). Using fallback feedback.`);
      return {
        keyStrengths: input.strengths,
        improvementAreas: input.improvements,
        coachingRecommendations: [
          "Continue refining clear real-world examples when explaining foundational topics.",
        ],
        actionableNextSteps: [
          "Review advanced edge cases and production scalability practices.",
        ],
      };
    }
  }
}
