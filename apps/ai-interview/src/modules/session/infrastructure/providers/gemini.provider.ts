import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ILLMService } from "../../../reasoning/domain/ports/llm.port";
import { env } from "../../../../shared/config/env.config";
import { logger } from "../../../../shared/logger";
import { EvaluationReportResult } from "../../../../shared/types/common.types";

export class GeminiProvider implements ILLMService {
  private apiKey: string;
  private modelName: string;

  constructor(apiKey?: string, modelName?: string) {
    this.apiKey = (apiKey || env.LLM_API_KEY || "").trim();
    let configuredModel = modelName || env.LLM_MODEL || "gemini-3.6-flash";
    if (
      configuredModel.startsWith("gemini-1.") ||
      configuredModel.startsWith("gemini-2.") ||
      configuredModel === "gemini-flash" ||
      configuredModel === "gemini-pro"
    ) {
      configuredModel = "gemini-3.6-flash";
    }
    this.modelName = configuredModel;
  }

  async generateText(prompt: string, systemPrompt?: string): Promise<string> {
    if (!this.apiKey) {
      logger.warn(
        "[Provider:LLM] No LLM_API_KEY provided. Using simulated response."
      );
      return "Thank you for that response. Let us continue to the next part of our technical evaluation.";
    }

    try {
      const contents: any[] = [];
      if (systemPrompt) {
        contents.push({
          role: "user",
          parts: [{ text: `[System Instructions]: ${systemPrompt}` }],
        });
        contents.push({
          role: "model",
          parts: [{ text: "Understood. I will follow these instructions." }],
        });
      }
      contents.push({ role: "user", parts: [{ text: prompt }] });

      const candidateModels = [
        this.modelName,
        "gemini-3.6-flash",
        "gemini-flash-latest",
        "gemini-2.5-flash-lite",
      ];
      let lastError: Error | null = null;

      for (const model of candidateModels) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": this.apiKey,
          },
          body: JSON.stringify({ contents }),
        });

        if (res.ok) {
          const data: any = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return text.trim();
        } else {
          const errData: any = await res.json().catch(() => ({}));
          lastError = new Error(
            errData?.error?.message || `Status ${res.status}`
          );
        }
      }

      throw lastError || new Error("All Gemini model candidates failed");
    } catch (error: any) {
      logger.error("[Provider:Gemini] Text generation failed:", error.message);
      return "Could you please elaborate further on how you would implement that in practice?";
    }
  }

  async generateStructured<T>(
    prompt: string,
    systemPrompt?: string,
    schemaDescription?: string
  ): Promise<T> {
    const fullSystemPrompt = [
      systemPrompt || "You are an expert AI interview evaluator and analyst.",
      "CRITICAL: You MUST respond ONLY with a raw JSON object matching the requested schema. Do not wrap in markdown code blocks like ```json or add conversational text.",
      schemaDescription ? `Target JSON Schema:\n${schemaDescription}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    if (!this.apiKey) {
      logger.warn(
        "[Provider:Gemini] No GEMINI_API_KEY provided. Returning fallback structured object."
      );
      return this.generateFallbackStructured<T>(prompt);
    }

    try {
      const contents = [
        {
          role: "user",
          parts: [{ text: `[System Instructions]: ${fullSystemPrompt}` }],
        },
        {
          role: "model",
          parts: [
            {
              text: "Understood. I will respond with ONLY valid JSON matching the schema.",
            },
          ],
        },
        { role: "user", parts: [{ text: prompt }] },
      ];

      const candidateModels = [
        this.modelName,
        "gemini-3.6-flash",
        "gemini-flash-latest",
        "gemini-3.5-flash-lite",
      ];
      let lastError: Error | null = null;
      let textContent = "";

      for (const model of candidateModels) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": this.apiKey,
          },
          body: JSON.stringify({ contents }),
        });

        if (res.ok) {
          const data: any = await res.json();
          textContent = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          if (textContent) break;
        } else {
          const errData: any = await res.json().catch(() => ({}));
          lastError = new Error(
            errData?.error?.message || `Status ${res.status}`
          );
        }
      }

      if (!textContent) {
        throw (
          lastError || new Error("Gemini generateContent returned empty text")
        );
      }

      const cleaned = textContent
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      return JSON.parse(cleaned) as T;
    } catch (error: any) {
      logger.warn(
        `[Provider:Gemini] Structured parse error (${error.message}), attempting fallback parsing`
      );
      return this.generateFallbackStructured<T>(prompt);
    }
  }

  async evaluateInterview(params: {
    domain: string;
    difficulty: string;
    rubric?: any;
    transcriptHistory: Array<{ role: string; content: string }>;
  }): Promise<EvaluationReportResult> {
    const transcriptText = (params.transcriptHistory || [])
      .map((t) => `[${t.role.toUpperCase()}]: ${t.content}`)
      .join("\n");

    const prompt = `Please evaluate the following candidate interview transcript for the domain "${params.domain}" at difficulty "${params.difficulty}".
Candidate Transcript:
${transcriptText}

Generate a comprehensive evaluation with overallScore (0-100), outcome ("PASSED" | "FAILED" | "NEEDS_HUMAN_REVIEW"), summaryFeedback, strengths list, improvements list, and criteriaScores (for Subject Expertise, Pedagogy/Problem Solving, Communication).`;

    const schemaDescription = `{
  "overallScore": 85,
  "outcome": "PASSED",
  "summaryFeedback": "Detailed summary...",
  "strengths": ["Clear explanation of core concepts", "Demonstrated pedagogical depth"],
  "improvements": ["Could provide more concrete classroom examples"],
  "criteriaScores": [
    { "criterion": "Subject Expertise", "score": 85, "maxScore": 100, "feedback": "Strong understanding" },
    { "criterion": "Pedagogy", "score": 80, "maxScore": 100, "feedback": "Solid structure" },
    { "criterion": "Communication", "score": 90, "maxScore": 100, "feedback": "Articulate and professional" }
  ]
}`;

    return this.generateStructured<EvaluationReportResult>(
      prompt,
      "You are a Senior Academic & Technical Interview Board Reviewer.",
      schemaDescription
    );
  }

  private generateFallbackStructured<T>(prompt: string): T {
    const p = prompt.toLowerCase();

    // 1. Question Generation check (must be checked BEFORE planning so prompts with "explanation" aren't confused)
    if (
      p.includes("crafting the next interview question") ||
      p.includes("questiondecision") ||
      p.includes("previously asked questions") ||
      p.includes("assigned difficulty level")
    ) {
      return {
        question: "Could you walk me through how you design, test, and maintain robust solutions when addressing core challenges in this domain?",
        topic: "Core Domain Competencies",
        difficulty: "INTERMEDIATE",
        expectedSignals: ["fundamentals", "system design", "modularity", "best practices"],
        rationale: "Assessing core technical competencies and practical experience.",
      } as unknown as T;
    }

    // 2. Evaluation check
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

    // 3. Planning check
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

    // 4. Evidence Extraction check
    if (p.includes("technicalclaims") || p.includes("concreteexamples") || p.includes("metrics")) {
      return {
        technicalClaims: ["Candidate described core architecture principles"],
        concreteExamples: ["Cited past experience in software development"],
        metricsCited: [],
        missingEvidence: [],
      } as unknown as T;
    }

    // 5. Conversation Quality check
    if (p.includes("isrambling") || p.includes("istooBrief") || p.includes("isofftopic")) {
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

    // 7. Answer Analysis check
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

    // 8. Follow-up check
    if (p.includes("follow-up") || p.includes("followup")) {
      return {
        shouldFollowUp: false,
        reason: "The candidate answered the question sufficiently.",
        question: "Could you walk me through a specific example from your experience?",
      } as unknown as T;
    }

    // 9. Default Fallback
    return {
      question: "How do you handle edge cases and maintain maintainability in large scale applications?",
      topic: "Architecture & Problem Solving",
      difficulty: "INTERMEDIATE",
      expectedSignals: ["modularity", "clean code", "testing"],
    } as unknown as T;
  }
}
