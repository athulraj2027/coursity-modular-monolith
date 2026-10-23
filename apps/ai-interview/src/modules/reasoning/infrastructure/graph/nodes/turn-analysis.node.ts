import { InterviewGraphStateType } from "../state-annotations";
import { globalAgentContainer } from "../../di/agent-container";
import { logger } from "../../../../../shared/logger";

export async function turnAnalysisNode(
  state: InterviewGraphStateType
): Promise<Partial<InterviewGraphStateType>> {
  if (!state.candidateAnswer) {
    logger.warn("[Node:TurnAnalysis] No candidate answer to analyze.");
    return {};
  }

  logger.info(
    `[Node:TurnAnalysis] Running multi-agent turn evaluation on answer for "${state.currentTopic}"`
  );

  const currentQ = state.currentQuestion || "Current question";
  const currentT = state.currentTopic || state.topics[0] || "General";
  const answer = state.candidateAnswer;

  const [
    answerAnalysisAgent,
    evidenceExtractionAgent,
    conversationQualityAgent,
    integrityAnomalyAgent,
  ] = await Promise.all([
    globalAgentContainer.getAnswerAnalysisAgent(),
    globalAgentContainer.getEvidenceExtractionAgent(),
    globalAgentContainer.getConversationQualityAgent(),
    globalAgentContainer.getIntegrityAnomalyAgent(),
  ]);

  const difficultyAdaptationAgent = globalAgentContainer.getDifficultyAdaptationAgent();

  // Run Agents 4, 5, 8, 12 in parallel for near-instant execution
  const [analysis, evidence, quality, anomaly] = await Promise.all([
    answerAnalysisAgent.analyze({
      domain: state.domain,
      difficulty: state.difficulty,
      currentQuestion: currentQ,
      currentTopic: currentT,
      candidateAnswer: answer,
      systemGuidelines: state.systemPrompt || undefined,
    }),
    evidenceExtractionAgent.extractEvidence({
      domain: state.domain,
      currentQuestion: currentQ,
      candidateAnswer: answer,
    }),
    conversationQualityAgent.evaluateQuality({
      question: currentQ,
      candidateAnswer: answer,
    }),
    integrityAnomalyAgent.detectAnomalies({
      question: currentQ,
      candidateAnswer: answer,
    }),
  ]);

  // Run Agent 7: Difficulty Adaptation
  const allAnalyses = [...(state.analyses || []), analysis];
  const adaptation = difficultyAdaptationAgent.adaptDifficulty({
    nominalDifficulty: state.difficulty,
    currentDifficulty: state.difficulty,
    recentAnalyses: allAnalyses,
  });

  return {
    answerAnalysis: analysis,
    analyses: [analysis],
    evidence,
    quality,
    anomaly,
    difficulty: adaptation.nextDifficulty,
    performanceTrend: adaptation.performanceTrend,
  };
}
