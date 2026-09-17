import { InterviewGraphStateType } from "../state-annotations";
import { InterviewPlannerAgent } from "../../../domain/agents/interview-planner.agent";
import { GeminiProvider } from "../../../../session/infrastructure/providers/gemini.provider";
import { logger } from "../../../../../shared/logger";

const gemini = new GeminiProvider();
const plannerAgent = new InterviewPlannerAgent(gemini);

export async function plannerNode(
  state: InterviewGraphStateType
): Promise<Partial<InterviewGraphStateType>> {
  if (state.plan && state.topics.length > 0) {
    return {};
  }

  logger.info(`[Node:Planner] Generating dynamic interview plan for ${state.candidate.name}`);

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
