import { InterviewGraphStateType } from "../state-annotations";
import { QuestionGenerationAgent } from "../../../domain/agents/question-generation.agent";
import { GeminiProvider } from "../../../../session/infrastructure/providers/gemini.provider";
import { logger } from "../../../../../shared/logger";

const gemini = new GeminiProvider();
const questionAgent = new QuestionGenerationAgent(gemini);

export async function questionNode(
  state: InterviewGraphStateType
): Promise<Partial<InterviewGraphStateType>> {
  logger.info(
    `[Node:Question] Synthesizing question for topic "${state.currentTopic}" (Action: ${state.nextAction}, Difficulty: ${state.difficulty})`
  );

  const targetTopic = state.currentTopic || state.topics[0] || "Foundational Knowledge";

  const decision = await questionAgent.generateQuestion({
    domain: state.domain,
    difficulty: state.difficulty,
    candidate: state.candidate,
    currentTopic: targetTopic,
    coveredTopics: state.coveredTopics,
    previousQuestions: state.previousQuestions,
    systemGuidelines: state.systemPrompt || undefined,
    performanceTrend: state.performanceTrend,
  });

  const isGreeting = state.nextAction === "GREETING" || state.questionIndex === 0;
  let responseText = decision.question;

  if (isGreeting) {
    responseText = `Hello ${state.candidate.name}! Welcome to your formal technical interview for ${state.domain}. I am Aura, your AI evaluator today. We will cover ${state.totalQuestions} key areas. Let's begin with our first question: ${decision.question}`;
  }

  const newQuestionIndex = isGreeting ? 1 : state.questionIndex + 1;

  return {
    currentQuestion: decision.question,
    responseText,
    questionIndex: newQuestionIndex,
    consecutiveFollowUps: 0,
    coveredTopics: [targetTopic],
    previousQuestions: [decision.question],
    phase: "QUESTION_ACTIVE",
    conversation: [
      {
        role: "ai",
        content: responseText,
        timestamp: new Date(),
      },
    ],
  };
}
