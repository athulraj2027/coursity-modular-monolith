import { InterviewGraphStateType } from "../state-annotations";
import { globalAgentContainer } from "../../di/agent-container";
import { logger } from "../../../../../shared/logger";

export async function plannerNode(
  state: InterviewGraphStateType
): Promise<Partial<InterviewGraphStateType>> {
  if (state.plan && state.topics.length > 0) {
    return {};
  }

  logger.info(`[Node:Planner] Generating dynamic interview plan for ${state.candidate.name}`);

  const plannerAgent = await globalAgentContainer.getPlannerAgent();
  const plan = await plannerAgent.createPlan({
    domain: state.domain,
    difficulty: state.difficulty,
    totalQuestions: state.totalQuestions,
    candidate: state.candidate,
    customGuidelines: state.systemPrompt || undefined,
  });

  const topicNames = Array.isArray(plan?.topics) ? plan.topics.map((t) => t.name) : state.topics;

  return {
    plan,
    topics: topicNames.length > 0 ? topicNames : state.topics,
    phase: "PLANNING",
  };
}
