import { ILLMService } from "../../../reasoning/domain/ports/llm.port";
import { globalSimulatedLLM } from "./simulated-llm.provider";
import { env } from "../../../../shared/config/env.config";
import { logger } from "../../../../shared/logger";

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
        "[Provider:Gemini] No LLM_API_KEY provided. Using simulated response."
      );
      return globalSimulatedLLM.generateText(prompt, systemPrompt);
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
      logger.error("[Provider:Gemini] Text generation failed, using fallback:", error.message);
      return globalSimulatedLLM.generateText(prompt, systemPrompt);
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
        "[Provider:Gemini] No GEMINI_API_KEY provided. Delegating to simulated structured provider."
      );
      return globalSimulatedLLM.generateStructured<T>(prompt, systemPrompt, schemaDescription);
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
        `[Provider:Gemini] Structured parse error (${error.message}), falling back to simulated output.`
      );
      return globalSimulatedLLM.generateStructured<T>(prompt, systemPrompt, schemaDescription);
    }
  }
}
