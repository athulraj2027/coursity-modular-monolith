import { InterviewGraphStateType } from "../state-annotations";
import { globalAgentContainer } from "../../di/agent-container";
import { logger } from "../../../../../shared/logger";

export async function followUpNode(
  state: InterviewGraphStateType
): Promise<Partial<InterviewGraphStateType>> {
  logger.info(
    `[Node:FollowUp] Generating targeted probe for topic "${state.currentTopic}"`
  );

  const fallbackAnalysis = state.answerAnalysis || {
    relevance: 0.7,
    completeness: 0.5,
    correctness: 0.7,
    clarity: 0.6,
    needsFollowUp: true,
    critique: "Needs concrete implementation detail.",
  };

  const followUpAgent = await globalAgentContainer.getFollowUpAgent();

  const decision = await followUpAgent.generateFollowUp({
    domain: state.domain,
    currentQuestion: state.currentQuestion || "Previous question",
    currentTopic: state.currentTopic || "Technical Deep-Dive",
    candidateAnswer: state.candidateAnswer || "",
    analysis: fallbackAnalysis,
    evidence: state.evidence,
    systemGuidelines: state.systemPrompt || undefined,
  });

  const responseText = decision.question;

  return {
    responseText,
    phase: "FOLLOW_UP",
    consecutiveFollowUps: state.consecutiveFollowUps + 1,
    conversation: [
      {
        role: "ai",
        content: responseText,
        timestamp: new Date(),
      },
    ],
  };
}
