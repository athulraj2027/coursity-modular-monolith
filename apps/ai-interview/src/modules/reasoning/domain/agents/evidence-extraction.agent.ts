import { ILLMService } from "../ports/llm.port";
import { ExtractedEvidence } from "../../../../shared/types/common.types";
import { logger } from "../../../../shared/logger";

export interface EvidenceExtractionInput {
  domain: string;
  currentQuestion: string;
  candidateAnswer: string;
  expectedSignals?: string[];
}

/**
 * 5. Evidence Extraction Agent
 * Responsibility: Extracts claims, examples, metrics, and missing evidence (Background).
 */
export class EvidenceExtractionAgent {
  constructor(private llm: ILLMService) {}

  async extractEvidence(input: EvidenceExtractionInput): Promise<ExtractedEvidence> {
    logger.info(
      `[Agent:EvidenceExtraction] Extracting factual claims and evidence from candidate turn`
    );

    const prompt = `You are a Fact and Evidence Extraction Specialist for technical interviews.
Domain: ${input.domain}
Question Asked: "${input.currentQuestion}"
Candidate Answer: "${input.candidateAnswer}"
Expected Key Signals: ${input.expectedSignals?.join(", ") || "Technical evidence, examples"}

Extract the following:
1. technicalClaims: List specific technical statements or factual assertions made.
2. concreteExamples: List real-world scenarios, case studies, or projects cited.
3. metricsCited: List numbers, benchmarks, percentages, or performance statistics mentioned.
4. missingEvidence: List critical evidence, edge-case considerations, or examples that were absent.`;

    const schemaDescription = `{
  "technicalClaims": ["Node.js uses libuv for thread pool operations", "Promises manage async queues"],
  "concreteExamples": ["Implemented WebSocket gateway in production for 10k users"],
  "metricsCited": ["Reduced latency by 40%"],
  "missingEvidence": ["Did not mention backpressure handling"]
}`;

    try {
      const result = await this.llm.generateStructured<ExtractedEvidence>(
        prompt,
        "You are an expert evidence extraction analyst.",
        schemaDescription
      );

      return {
        technicalClaims: Array.isArray(result.technicalClaims) ? result.technicalClaims : [],
        concreteExamples: Array.isArray(result.concreteExamples) ? result.concreteExamples : [],
        metricsCited: Array.isArray(result.metricsCited) ? result.metricsCited : [],
        missingEvidence: Array.isArray(result.missingEvidence) ? result.missingEvidence : [],
      };
    } catch (err: any) {
      logger.warn(`[Agent:EvidenceExtraction] Extraction failed (${err.message}). Returning empty evidence.`);
      return {
        technicalClaims: ["Answer provided direct response to prompt"],
        concreteExamples: [],
        metricsCited: [],
        missingEvidence: [],
      };
    }
  }
}
