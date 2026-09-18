import { ILLMService } from "../ports/llm.port";
import {
  InterviewPlan,
  InterviewDifficulty,
  CandidateContext,
} from "../../../../shared/types/common.types";
import { logger } from "../../../../shared/logger";

export interface PlannerInput {
  domain: string;
  difficulty: InterviewDifficulty;
  totalQuestions: number;
  candidate: CandidateContext;
  customGuidelines?: string;
}

/**
 * 2. Interview Planner Agent
 * Responsibility: Creates and dynamically updates the interview plan (Start + background).
 */
export class InterviewPlannerAgent {
  constructor(private llm: ILLMService) {}

  async createPlan(input: PlannerInput): Promise<InterviewPlan> {
    logger.info(
      `[Agent:Planner] Creating dynamic interview plan for ${input.candidate.name} in "${input.domain}"`
    );

    const prompt = `You are the Lead Technical Interview Planner.
Create a structured evaluation plan for candidate ${input.candidate.name}.
Target Domain: ${input.domain}
Target Difficulty: ${input.difficulty}
Planned Question Count: ${input.totalQuestions}
Candidate Profile:
- Bio: ${input.candidate.bio || "N/A"}
- Experience: ${input.candidate.experienceYears ?? "Not specified"} years
- Declared Expertise: ${input.candidate.expertise?.join(", ") || "General"}
- Resume Highlights: ${input.candidate.resumeHighlights?.join("; ") || "N/A"}
${input.customGuidelines ? `Guidelines: ${input.customGuidelines}` : ""}

Structure an interview plan covering core competencies, practical pedagogy/problem solving, and advanced architectural/scaling depth.
Return a plan with 3-4 distinct topics, assigned weights summing to 1.0, minimum questions, and expected signals.`;

    const schemaDescription = `{
  "planId": "plan_${Date.now()}",
  "domain": "${input.domain}",
  "initialDifficulty": "${input.difficulty}",
  "currentDifficulty": "${input.difficulty}",
  "totalPlannedQuestions": ${input.totalQuestions},
  "topics": [
    {
      "id": "t1",
      "name": "Foundations & Core Principles",
      "difficulty": "${input.difficulty}",
      "weight": 0.35,
      "minQuestions": 1,
      "expectedSignals": ["fundamentals", "syntax", "core abstractions"],
      "covered": false
    },
    {
      "id": "t2",
      "name": "Pedagogy & Problem Solving",
      "difficulty": "${input.difficulty}",
      "weight": 0.35,
      "minQuestions": 2,
      "expectedSignals": ["student scaffolding", "differentiation", "debugging"],
      "covered": false
    },
    {
      "id": "t3",
      "name": "Advanced Architecture & Systems",
      "difficulty": "${input.difficulty}",
      "weight": 0.30,
      "minQuestions": 2,
      "expectedSignals": ["scalability", "concurrency", "trade-offs"],
      "covered": false
    }
  ],
  "strategyNotes": "Evaluate conceptual accuracy first, then test practical classroom pedagogy and trade-offs."
}`;

    try {
      return await this.llm.generateStructured<InterviewPlan>(
        prompt,
        "You are an expert curriculum and technical interview planner.",
        schemaDescription
      );
    } catch (err: any) {
      logger.warn(`[Agent:Planner] Planning failed (${err.message}). Using standard fallback plan.`);
      return {
        planId: `plan_${Date.now()}`,
        domain: input.domain,
        initialDifficulty: input.difficulty,
        currentDifficulty: input.difficulty,
        totalPlannedQuestions: input.totalQuestions,
        topics: [
          {
            id: "t1",
            name: "Core Domain Competencies",
            difficulty: input.difficulty,
            weight: 0.4,
            minQuestions: 2,
            expectedSignals: ["fundamentals", "conceptual clarity"],
            covered: false,
          },
          {
            id: "t2",
            name: "Pedagogy & Problem Solving",
            difficulty: input.difficulty,
            weight: 0.35,
            minQuestions: 2,
            expectedSignals: ["differentiation", "student support"],
            covered: false,
          },
          {
            id: "t3",
            name: "System Architecture & Best Practices",
            difficulty: input.difficulty,
            weight: 0.25,
            minQuestions: 1,
            expectedSignals: ["scalability", "clean code"],
            covered: false,
          },
        ],
        strategyNotes: "Standard adaptive assessment path.",
      };
    }
  }
}
