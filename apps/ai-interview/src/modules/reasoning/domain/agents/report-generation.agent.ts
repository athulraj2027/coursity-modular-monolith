import { ILLMService } from "../ports/llm.port";
import {
  EvaluationReportResult,
  DialogueMessage,
  CandidateContext,
} from "../../../../shared/types/common.types";
import { RawEvaluationResult } from "./interview-evaluation.agent";
import { logger } from "../../../../shared/logger";

export interface ReportGenerationInput {
  domain: string;
  difficulty: string;
  candidate: CandidateContext;
  rawEvaluation: RawEvaluationResult;
  conversation: DialogueMessage[];
  anomalySignals?: string[];
}

/**
 * 10. Report Generation Agent
 * Responsibility: Produces the structured interview report (End/background).
 */
export class ReportGenerationAgent {
  constructor(private llm: ILLMService) {}

  async generateReport(input: ReportGenerationInput): Promise<EvaluationReportResult> {
    logger.info(
      `[Agent:ReportGeneration] Compiling final structured report for ${input.candidate.name}`
    );

    const prompt = `You are a Technical Dossier and Executive Report Specialist.
Synthesize the final formal assessment report for candidate ${input.candidate.name}.
Domain: ${input.domain} (${input.difficulty})
Overall Score: ${input.rawEvaluation.overallScore} (Outcome: ${input.rawEvaluation.outcome})
Summary: "${input.rawEvaluation.summaryFeedback}"

Generate:
1. 3-4 specific technical strengths demonstrated during the interview.
2. 2-3 specific technical or pedagogical areas for improvement.
3. executive summary paragraph for administrative reviewers.`;

    const schemaDescription = `{
  "strengths": [
    "Demonstrated accurate mental models of asynchronous execution",
    "Clear instructional scaffolding when explaining complex topics"
  ],
  "improvements": [
    "Could incorporate more quantitative metrics and benchmarking data"
  ],
  "summaryFeedback": "The candidate presented a coherent, thorough technical foundation..."
}`;

    try {
      const result = await this.llm.generateStructured<{
        strengths: string[];
        improvements: string[];
        summaryFeedback?: string;
      }>(prompt, "You are a professional report compiler.", schemaDescription);

      return {
        overallScore: input.rawEvaluation.overallScore,
        outcome: input.rawEvaluation.outcome,
        summaryFeedback: result.summaryFeedback || input.rawEvaluation.summaryFeedback,
        strengths: Array.isArray(result.strengths) && result.strengths.length > 0
          ? result.strengths
          : ["Demonstrated solid core subject knowledge", "Effective communication style"],
        improvements: Array.isArray(result.improvements) && result.improvements.length > 0
          ? result.improvements
          : ["Deepen discussion of real-world edge cases"],
        criteriaScores: input.rawEvaluation.criteriaScores,
        anomalySummary: input.anomalySignals,
      };
    } catch (err: any) {
      logger.warn(`[Agent:ReportGeneration] Generation failed (${err.message}). Using fallback report.`);
      return {
        overallScore: input.rawEvaluation.overallScore,
        outcome: input.rawEvaluation.outcome,
        summaryFeedback: input.rawEvaluation.summaryFeedback,
        strengths: ["Solid understanding of core domain principles", "Clear, professional communication"],
        improvements: ["Provide more production-level case studies"],
        criteriaScores: input.rawEvaluation.criteriaScores,
        anomalySummary: input.anomalySignals,
      };
    }
  }
}
