import { NextAction, InterviewPhase, AnswerAnalysis } from "../../../../shared/types/common.types";
import { logger } from "../../../../shared/logger";

export interface SupervisorInput {
  phase?: InterviewPhase;
  questionIndex?: number;
  totalQuestions?: number;
  topics?: string[];
  coveredTopics?: string[];
  currentTopic?: string | null;
  candidateAnswer?: string | null;
  answerAnalysis?: AnswerAnalysis | null;
  consecutiveFollowUps?: number;
  timeRemainingSeconds?: number;
}

export interface SupervisorDecision {
  nextAction: NextAction;
  targetPhase: InterviewPhase;
  targetTopic: string;
  reason: string;
}

/**
 * 1. Interview Supervisor Agent
 * Responsibility: Controls interview flow and decides the next action (Real-time).
 */
export class InterviewSupervisorAgent {
  private maxFollowUpsPerQuestion: number = 1;

  constructor(options?: { maxFollowUpsPerQuestion?: number }) {
    if (options?.maxFollowUpsPerQuestion !== undefined) {
      this.maxFollowUpsPerQuestion = options.maxFollowUpsPerQuestion;
    }
  }

  decide(input: SupervisorInput): SupervisorDecision {
    const phase = input.phase || "INITIALIZING";
    const questionIndex = input.questionIndex ?? 0;
    const totalQuestions = input.totalQuestions ?? 5;
    const topics = input.topics || ["Core Competencies"];
    const coveredTopics = input.coveredTopics || [];

    logger.info(
      `[Agent:Supervisor] Evaluating state: phase=${phase}, questionIndex=${questionIndex}/${totalQuestions}, coveredTopics=${coveredTopics.length}/${topics.length}`
    );

    // 0. Completed or evaluating state
    if (phase === "EVALUATING" || phase === "COMPLETED") {
      return {
        nextAction: "END_INTERVIEW",
        targetPhase: "EVALUATING",
        targetTopic: input.currentTopic || "Evaluation",
        reason: "Interview session finalized.",
      };
    }

    // 1. Initial greeting transition
    if (phase === "INITIALIZING" || phase === "PLANNING" || questionIndex === 0) {
      const firstTopic = topics[0] || "Foundational Knowledge";
      return {
        nextAction: "GREETING",
        targetPhase: "GREETING",
        targetTopic: firstTopic,
        reason: "Initial session start. Welcome candidate and introduce first topic.",
      };
    }

    if (phase === "GREETING") {
      const firstTopic = topics[0] || "Foundational Knowledge";
      return {
        nextAction: "ASK_QUESTION",
        targetPhase: "QUESTION_ACTIVE",
        targetTopic: firstTopic,
        reason: "Candidate acknowledged greeting. Asking first formal question.",
      };
    }

    // 2. Check if total question quota reached or time expired
    const allQuestionsCovered = questionIndex >= totalQuestions;
    const allTopicsCovered = topics.length > 0 && coveredTopics.length >= topics.length;
    const isTimeExpired = input.timeRemainingSeconds !== undefined && input.timeRemainingSeconds <= 0;

    if (allQuestionsCovered || (allTopicsCovered && questionIndex >= totalQuestions) || isTimeExpired) {
      return {
        nextAction: "END_INTERVIEW",
        targetPhase: "EVALUATING",
        targetTopic: input.currentTopic || "Evaluation",
        reason: isTimeExpired
          ? "Allocated interview duration has elapsed."
          : `All planned questions (${totalQuestions}) and topics have been evaluated.`,
      };
    }

    // 3. Check for adaptive follow-up
    const followUpsCount = input.consecutiveFollowUps || 0;
    if (
      input.answerAnalysis?.needsFollowUp &&
      followUpsCount < this.maxFollowUpsPerQuestion &&
      phase !== "FOLLOW_UP"
    ) {
      return {
        nextAction: "FOLLOW_UP",
        targetPhase: "FOLLOW_UP",
        targetTopic: input.currentTopic || topics[0] || "Technical Deep-Dive",
        reason: `Answer analysis flagged need for follow-up probe: ${input.answerAnalysis.critique || "needs concrete evidence"}.`,
      };
    }

    // 4. Move to next question / next topic
    const remainingTopics = topics.filter((t) => !coveredTopics.includes(t));
    const nextTopic =
      remainingTopics.length > 0
        ? remainingTopics[0]
        : topics[questionIndex % Math.max(1, topics.length)] ||
          "Advanced Competencies";

    return {
      nextAction: "ASK_QUESTION",
      targetPhase: "QUESTION_ACTIVE",
      targetTopic: nextTopic,
      reason: `Advancing to question ${questionIndex + 1} on topic "${nextTopic}".`,
    };
  }
}
