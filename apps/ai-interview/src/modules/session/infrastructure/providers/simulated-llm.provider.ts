import { ILLMService } from "../../../reasoning/domain/ports/llm.port";

export class SimulatedLLMProvider implements ILLMService {
  async generateText(prompt: string, _systemPrompt?: string): Promise<string> {
    const p = prompt.toLowerCase();
    if (p.includes("greeting") || p.includes("hello")) {
      return "Hello! Welcome to your technical interview. Let's begin.";
    }
    return "Thank you for that response. Let us continue to the next part of our technical evaluation.";
  }

  async generateStructured<T>(
    prompt: string,
    _systemPrompt?: string,
    _schemaDescription?: string
  ): Promise<T> {
    const p = prompt.toLowerCase();

    // 1. Question Generation
    if (
      p.includes("crafting the next interview question") ||
      p.includes("questiondecision") ||
      p.includes("previously asked questions") ||
      p.includes("assigned difficulty level")
    ) {
      return {
        question:
          "Could you walk me through how you design, test, and maintain robust solutions when addressing core challenges in this domain?",
        topic: "Core Domain Competencies",
        difficulty: "INTERMEDIATE",
        expectedSignals: ["fundamentals", "system design", "modularity", "best practices"],
        rationale: "Assessing core technical competencies and practical experience.",
      } as unknown as T;
    }

    // 2. Evaluation
    if (
      p.includes("overallscore") ||
      p.includes("criteriascores") ||
      p.includes("board reviewer") ||
      p.includes("comprehensive rubric evaluation")
    ) {
      return {
        overallScore: 82,
        outcome: "PASSED",
        summaryFeedback:
          "The candidate demonstrated strong foundational knowledge and clear communication throughout the interview session.",
        strengths: [
          "Articulate explanations of core domain principles",
          "Structured approach to problem solving",
        ],
        improvements: [
          "Include more concrete production metrics or classroom case studies",
        ],
        criteriaScores: [
          {
            criterion: "Subject Expertise",
            score: 84,
            maxScore: 100,
            weight: 0.4,
            feedback: "Demonstrated solid technical depth and conceptual accuracy.",
          },
          {
            criterion: "Pedagogy / Problem Solving",
            score: 80,
            maxScore: 100,
            weight: 0.35,
            feedback: "Logical step-by-step reasoning and systematic explanations.",
          },
          {
            criterion: "Communication & Professionalism",
            score: 88,
            maxScore: 100,
            weight: 0.25,
            feedback: "Concise, articulate, and engaged professionally.",
          },
        ],
      } as unknown as T;
    }

    // 3. Planning
    if (
      p.includes("dynamic interview plan") ||
      p.includes("initialdifficulty") ||
      p.includes("totalplannedquestions") ||
      p.includes("topics with weights")
    ) {
      return {
        planId: `plan_${Date.now()}`,
        domain: "Technical Evaluation",
        initialDifficulty: "INTERMEDIATE",
        currentDifficulty: "INTERMEDIATE",
        totalPlannedQuestions: 5,
        topics: [
          {
            id: "t1",
            name: "Core Domain Competencies",
            difficulty: "INTERMEDIATE",
            weight: 0.4,
            minQuestions: 2,
            expectedSignals: ["fundamentals", "conceptual clarity"],
            covered: false,
          },
          {
            id: "t2",
            name: "Pedagogy & Problem Solving",
            difficulty: "INTERMEDIATE",
            weight: 0.35,
            minQuestions: 2,
            expectedSignals: ["differentiation", "student support"],
            covered: false,
          },
          {
            id: "t3",
            name: "System Architecture & Best Practices",
            difficulty: "INTERMEDIATE",
            weight: 0.25,
            minQuestions: 1,
            expectedSignals: ["scalability", "clean code"],
            covered: false,
          },
        ],
        strategyNotes: "Standard adaptive assessment path.",
      } as unknown as T;
    }

    // 4. Evidence Extraction
    if (p.includes("technicalclaims") || p.includes("concreteexamples") || p.includes("metrics")) {
      return {
        technicalClaims: ["Candidate described core architecture principles"],
        concreteExamples: ["Cited past experience in software development"],
        metricsCited: [],
        missingEvidence: [],
      } as unknown as T;
    }

    // 5. Conversation Quality
    if (p.includes("isrambling") || p.includes("istoobrief") || p.includes("isofftopic")) {
      return {
        isRambling: false,
        isTooBrief: false,
        isOffTopic: false,
        isMisunderstood: false,
        sentiment: "CONFIDENT",
        qualityScore: 0.9,
      } as unknown as T;
    }

    // 6. Integrity check
    if (p.includes("anomaly") || p.includes("prompt_injection") || p.includes("integrity")) {
      return {
        anomalyDetected: false,
        severity: "LOW",
        reason: "Normal candidate speech.",
      } as unknown as T;
    }

    // 7. Answer Analysis
    if (p.includes("relevance") || p.includes("expected key signals") || p.includes("analyze")) {
      return {
        relevance: 0.88,
        completeness: 0.82,
        correctness: 0.85,
        clarity: 0.85,
        needsFollowUp: false,
        critique: "Well-reasoned response addressing the primary question.",
      } as unknown as T;
    }

    // 8. Follow-up
    if (p.includes("follow-up") || p.includes("followup")) {
      return {
        shouldFollowUp: false,
        reason: "The candidate answered the question sufficiently.",
        question: "Could you walk me through a specific example from your experience?",
      } as unknown as T;
    }

    // Default Fallback
    return {
      question:
        "How do you handle edge cases and maintain maintainability in large scale applications?",
      topic: "Architecture & Problem Solving",
      difficulty: "INTERMEDIATE",
      expectedSignals: ["modularity", "clean code", "testing"],
    } as unknown as T;
  }
}

export const globalSimulatedLLM = new SimulatedLLMProvider();
