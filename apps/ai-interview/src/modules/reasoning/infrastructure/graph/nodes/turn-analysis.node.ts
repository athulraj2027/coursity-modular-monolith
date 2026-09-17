import { InterviewGraphStateType } from "../state-annotations";
import { AnswerAnalysisAgent } from "../../../domain/agents/answer-analysis.agent";
import { EvidenceExtractionAgent } from "../../../domain/agents/evidence-extraction.agent";
import { ConversationQualityAgent } from "../../../domain/agents/conversation-quality.agent";
import { IntegrityAnomalyAgent } from "../../../domain/agents/integrity-anomaly.agent";
import { DifficultyAdaptationAgent } from "../../../domain/agents/difficulty-adaptation.agent";
import { GeminiProvider } from "../../../../session/infrastructure/providers/gemini.provider";
import { logger } from "../../../../../shared/logger";

const gemini = new GeminiProvider();
const answerAnalysisAgent = new AnswerAnalysisAgent(gemini);
const evidenceExtractionAgent = new EvidenceExtractionAgent(gemini);
const conversationQualityAgent = new ConversationQualityAgent(gemini);
const integrityAnomalyAgent = new IntegrityAnomalyAgent(gemini);
const difficultyAdaptationAgent = new DifficultyAdaptationAgent();

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
