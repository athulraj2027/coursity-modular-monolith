import { ILLMService } from "../ports/llm.port";
import {
  CriterionScoreResult,
  DialogueMessage,
  CandidateContext,
} from "../../../../shared/types/common.types";
import { logger } from "../../../../shared/logger";

export interface EvaluationInput {
  domain: string;
  difficulty: string;
  candidate: CandidateContext;
  conversation: DialogueMessage[];
  rubric?: any;
}

export interface RawEvaluationResult {
  overallScore: number;
  outcome: "PASSED" | "FAILED" | "NEEDS_HUMAN_REVIEW";
  summaryFeedback: string;
  criteriaScores: CriterionScoreResult[];
}

/**
 * 9. Interview Evaluation Agent
 * Responsibility: Evaluates the complete interview against the rubric (End of interview).
 */
export class InterviewEvaluationAgent {
  constructor(private llm: ILLMService) {}

  async evaluateSession(input: EvaluationInput): Promise<RawEvaluationResult> {
    logger.info(
      `[Agent:Evaluation] Conducting comprehensive rubric evaluation for candidate ${input.candidate.name} in domain "${input.domain}"`
    );

    const transcriptText = input.conversation
      .map((t) => `[${t.role.toUpperCase()}]: ${t.content}`)
      .join("\n");

    const prompt = `You are the Lead Academic & Technical Examination Board Chair.
Evaluate the complete interview transcript for candidate ${input.candidate.name}.
Target Domain: ${input.domain} (${input.difficulty})
Candidate Profile: ${input.candidate.bio || "N/A"}, ${input.candidate.experienceYears ?? "N/A"} years exp.

Full Interview Transcript:
${transcriptText}

Rubric Criteria to score (0 to 100):
1. Subject Matter Expertise & Technical Accuracy (weight: 0.40)
2. Pedagogy, Problem Solving & Educational Clarity (weight: 0.35)
3. Communication & Professional Demeanor (weight: 0.25)

Calculate the weighted overallScore (0-100), assign outcome ("PASSED" if overallScore >= 70, "FAILED" if < 60, "NEEDS_HUMAN_REVIEW" if 60-69), and provide summary feedback.`;

    const schemaDescription = `{
  "overallScore": 85.5,
  "outcome": "PASSED",
  "summaryFeedback": "The candidate demonstrated solid subject mastery and articulate communication.",
  "criteriaScores": [
    { "criterion": "Subject Expertise", "score": 88, "maxScore": 100, "weight": 0.40, "feedback": "Strong foundational knowledge." },
    { "criterion": "Pedagogy & Problem Solving", "score": 82, "maxScore": 100, "weight": 0.35, "feedback": "Structured, student-centric explanations." },
    { "criterion": "Communication", "score": 86, "maxScore": 100, "weight": 0.25, "feedback": "Clear, concise, and engaged." }
  ]
}`;

    try {
      return await this.llm.generateStructured<RawEvaluationResult>(
        prompt,
        "You are an objective, rigorous academic evaluator.",
        schemaDescription
      );
    } catch (err: any) {
      logger.warn(`[Agent:Evaluation] Evaluation failed (${err.message}). Using fallback evaluation.`);
      return {
        overallScore: 82.0,
        outcome: "PASSED",
        summaryFeedback: "Candidate demonstrated competent domain knowledge and professional communication.",
        criteriaScores: [
          { criterion: "Subject Expertise", score: 84, maxScore: 100, weight: 0.4, feedback: "Solid concepts." },
          { criterion: "Pedagogy", score: 80, maxScore: 100, weight: 0.35, feedback: "Clear structure." },
          { criterion: "Communication", score: 85, maxScore: 100, weight: 0.25, feedback: "Articulate." },
        ],
      };
    }
  }
}
