import {
  InterviewDifficulty,
  AnswerAnalysis,
} from "../../../../shared/types/common.types";
import { logger } from "../../../../shared/logger";

export interface AdaptationInput {
  nominalDifficulty: InterviewDifficulty;
  currentDifficulty: InterviewDifficulty;
  recentAnalyses: AnswerAnalysis[];
}

export interface AdaptationResult {
  nextDifficulty: InterviewDifficulty;
  performanceTrend: "STRONG" | "MODERATE" | "STRUGGLING";
  reason: string;
}

/**
 * 7. Difficulty Adaptation Agent
 * Responsibility: Adjusts question difficulty based on demonstrated ability (Real-time/background).
 */
export class DifficultyAdaptationAgent {
  private difficultyLevels: InterviewDifficulty[] = [
    "BEGINNER",
    "INTERMEDIATE",
    "ADVANCED",
    "EXPERT",
  ];

  adaptDifficulty(input: AdaptationInput): AdaptationResult {
    logger.info(
      `[Agent:DifficultyAdaptation] Evaluating demonstrated ability (Current: ${input.currentDifficulty}, Total turns: ${input.recentAnalyses.length})`
    );

    if (input.recentAnalyses.length === 0) {
      return {
        nextDifficulty: input.currentDifficulty,
        performanceTrend: "MODERATE",
        reason: "Initial turn - maintaining nominal difficulty.",
      };
    }

    const window = input.recentAnalyses.slice(-2);
    const avgScore =
      window.reduce(
        (acc, a) => acc + (a.relevance + a.completeness + a.correctness + a.clarity) / 4,
        0
      ) / window.length;

    const currentIndex = this.difficultyLevels.indexOf(input.currentDifficulty);

    if (avgScore >= 0.88 && currentIndex < this.difficultyLevels.length - 1) {
      const nextDiff = this.difficultyLevels[currentIndex + 1];
      return {
        nextDifficulty: nextDiff,
        performanceTrend: "STRONG",
        reason: `High performance score (${avgScore.toFixed(2)}) - elevating to ${nextDiff}.`,
      };
    }

    if (avgScore < 0.60 && currentIndex > 0) {
      const nextDiff = this.difficultyLevels[currentIndex - 1];
      return {
        nextDifficulty: nextDiff,
        performanceTrend: "STRUGGLING",
        reason: `Candidate struggling on previous questions (${avgScore.toFixed(2)}) - adapting down to ${nextDiff} to test fundamentals.`,
      };
    }

    return {
      nextDifficulty: input.currentDifficulty,
      performanceTrend: avgScore >= 0.75 ? "STRONG" : "MODERATE",
      reason: `Stable performance (${avgScore.toFixed(2)}) - retaining ${input.currentDifficulty}.`,
    };
  }
}
