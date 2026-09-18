import { InterviewGraphStateType } from "../state-annotations";
import { InterviewSupervisorAgent } from "../../../domain/agents/supervisor.agent";
import { logger } from "../../../../../shared/logger";

const supervisorAgent = new InterviewSupervisorAgent();

export function supervisorNode(
  state: InterviewGraphStateType
): Partial<InterviewGraphStateType> {
  logger.info(`[Node:Supervisor] Inspecting state for interview ${state.interviewId}`);

  const decision = supervisorAgent.decide({
    phase: state.phase,
    questionIndex: state.questionIndex,
    totalQuestions: state.totalQuestions,
    topics: state.topics,
    coveredTopics: state.coveredTopics,
    currentTopic: state.currentTopic,
    candidateAnswer: state.candidateAnswer,
    answerAnalysis: state.answerAnalysis,
    consecutiveFollowUps: state.consecutiveFollowUps,
    timeRemainingSeconds: state.timeRemainingSeconds,
  });

  logger.info(
    `[Node:Supervisor] Action -> ${decision.nextAction} (Phase: ${decision.targetPhase}, Topic: "${decision.targetTopic}")`
  );

  return {
    nextAction: decision.nextAction,
    phase: decision.targetPhase,
    currentTopic: decision.targetTopic,
  };
}
