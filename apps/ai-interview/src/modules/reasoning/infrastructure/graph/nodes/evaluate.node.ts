import { InterviewGraphStateType } from "../state-annotations";
import { InterviewEvaluationAgent } from "../../../domain/agents/interview-evaluation.agent";
import { ReportGenerationAgent } from "../../../domain/agents/report-generation.agent";
import { FeedbackCoachingAgent } from "../../../domain/agents/feedback-coaching.agent";
import { GeminiProvider } from "../../../../session/infrastructure/providers/gemini.provider";
import { logger } from "../../../../../shared/logger";

const gemini = new GeminiProvider();
const evaluationAgent = new InterviewEvaluationAgent(gemini);
const reportAgent = new ReportGenerationAgent(gemini);
const coachingAgent = new FeedbackCoachingAgent(gemini);

export async function evaluateNode(
  state: InterviewGraphStateType
): Promise<Partial<InterviewGraphStateType>> {
  logger.info(
    `[Node:Evaluate] Compiling final multi-agent evaluation for ${state.candidate.name} in "${state.domain}"`
  );

  const anomalies = state.anomaly?.anomalyDetected
    ? [`[${state.anomaly.severity}] ${state.anomaly.reason || state.anomaly.anomalyType}`]
    : undefined;

  // 1. Agent 9: Interview Evaluation Agent
  const rawEval = await evaluationAgent.evaluateSession({
    domain: state.domain || "Technical Evaluation",
    difficulty: state.difficulty || "INTERMEDIATE",
    candidate: state.candidate,
    conversation: state.conversation || [],
  });

  // 2. Agent 10: Report Generation Agent
  const report = await reportAgent.generateReport({
    domain: state.domain,
    difficulty: state.difficulty,
    candidate: state.candidate,
    rawEvaluation: rawEval,
    conversation: state.conversation || [],
    anomalySignals: anomalies,
  });

  // 3. Agent 11: Feedback/Coaching Agent
  const feedback = await coachingAgent.generateCoaching({
    domain: state.domain,
    candidate: state.candidate,
    overallScore: report.overallScore,
    strengths: report.strengths,
    improvements: report.improvements,
  });

  const fullReport = {
    ...report,
    candidateFeedback: feedback,
  };

  logger.info(`[Node:Evaluate] Final report generated: Score=${report.overallScore}, Outcome=${report.outcome}`);

  const responseText = `Thank you, ${state.candidate.name}. You have completed all technical questions for this session. Your evaluation has been compiled and submitted for final review. Have a great day!`;

  return {
    evaluation: fullReport,
    feedback,
    responseText,
    phase: "COMPLETED",
    conversation: [
      {
        role: "ai",
        content: responseText,
        timestamp: new Date(),
      },
    ],
  };
}
