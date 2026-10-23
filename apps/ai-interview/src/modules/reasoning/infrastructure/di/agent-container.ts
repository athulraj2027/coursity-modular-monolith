import { ILLMService } from "../../domain/ports/llm.port";
import { InterviewPlannerAgent } from "../../domain/agents/interview-planner.agent";
import { QuestionGenerationAgent } from "../../domain/agents/question-generation.agent";
import { AnswerAnalysisAgent } from "../../domain/agents/answer-analysis.agent";
import { EvidenceExtractionAgent } from "../../domain/agents/evidence-extraction.agent";
import { ConversationQualityAgent } from "../../domain/agents/conversation-quality.agent";
import { IntegrityAnomalyAgent } from "../../domain/agents/integrity-anomaly.agent";
import { DifficultyAdaptationAgent } from "../../domain/agents/difficulty-adaptation.agent";
import { FollowUpAgent } from "../../domain/agents/follow-up.agent";
import { InterviewEvaluationAgent } from "../../domain/agents/interview-evaluation.agent";
import { ReportGenerationAgent } from "../../domain/agents/report-generation.agent";
import { FeedbackCoachingAgent } from "../../domain/agents/feedback-coaching.agent";
import { InterviewSupervisorAgent } from "../../domain/agents/supervisor.agent";
import { globalProviderRegistry } from "../../../session/infrastructure/registry/provider.registry";
import { globalSimulatedLLM } from "../../../session/infrastructure/providers/simulated-llm.provider";

export interface IAgentContainer {
  getSupervisorAgent(): InterviewSupervisorAgent;
  getPlannerAgent(): Promise<InterviewPlannerAgent>;
  getQuestionAgent(): Promise<QuestionGenerationAgent>;
  getFollowUpAgent(): Promise<FollowUpAgent>;
  getAnswerAnalysisAgent(): Promise<AnswerAnalysisAgent>;
  getEvidenceExtractionAgent(): Promise<EvidenceExtractionAgent>;
  getConversationQualityAgent(): Promise<ConversationQualityAgent>;
  getIntegrityAnomalyAgent(): Promise<IntegrityAnomalyAgent>;
  getDifficultyAdaptationAgent(): DifficultyAdaptationAgent;
  getEvaluationAgent(): Promise<InterviewEvaluationAgent>;
  getReportAgent(): Promise<ReportGenerationAgent>;
  getCoachingAgent(): Promise<FeedbackCoachingAgent>;
}

export class AgentContainer implements IAgentContainer {
  private customLLM?: ILLMService;
  private readonly supervisorAgent = new InterviewSupervisorAgent();
  private readonly difficultyAgent = new DifficultyAdaptationAgent();

  constructor(customLLM?: ILLMService) {
    this.customLLM = customLLM;
  }

  setCustomLLM(llm: ILLMService): void {
    this.customLLM = llm;
  }

  private async resolveLLM(agentType: string): Promise<ILLMService> {
    if (this.customLLM) {
      return this.customLLM;
    }
    try {
      return await globalProviderRegistry.getLLM(agentType);
    } catch {
      return globalSimulatedLLM;
    }
  }

  getSupervisorAgent(): InterviewSupervisorAgent {
    return this.supervisorAgent;
  }

  getDifficultyAdaptationAgent(): DifficultyAdaptationAgent {
    return this.difficultyAgent;
  }

  async getPlannerAgent(): Promise<InterviewPlannerAgent> {
    const llm = await this.resolveLLM("INTERVIEW_PLANNER");
    return new InterviewPlannerAgent(llm);
  }

  async getQuestionAgent(): Promise<QuestionGenerationAgent> {
    const llm = await this.resolveLLM("QUESTION_GENERATOR");
    return new QuestionGenerationAgent(llm);
  }

  async getFollowUpAgent(): Promise<FollowUpAgent> {
    const llm = await this.resolveLLM("FOLLOW_UP");
    return new FollowUpAgent(llm);
  }

  async getAnswerAnalysisAgent(): Promise<AnswerAnalysisAgent> {
    const llm = await this.resolveLLM("ANSWER_ANALYZER");
    return new AnswerAnalysisAgent(llm);
  }

  async getEvidenceExtractionAgent(): Promise<EvidenceExtractionAgent> {
    const llm = await this.resolveLLM("EVIDENCE_EXTRACTOR");
    return new EvidenceExtractionAgent(llm);
  }

  async getConversationQualityAgent(): Promise<ConversationQualityAgent> {
    const llm = await this.resolveLLM("CONVERSATION_QUALITY");
    return new ConversationQualityAgent(llm);
  }

  async getIntegrityAnomalyAgent(): Promise<IntegrityAnomalyAgent> {
    const llm = await this.resolveLLM("INTEGRITY");
    return new IntegrityAnomalyAgent(llm);
  }

  async getEvaluationAgent(): Promise<InterviewEvaluationAgent> {
    const llm = await this.resolveLLM("EVALUATOR");
    return new InterviewEvaluationAgent(llm);
  }

  async getReportAgent(): Promise<ReportGenerationAgent> {
    const llm = await this.resolveLLM("REPORT_GENERATOR");
    return new ReportGenerationAgent(llm);
  }

  async getCoachingAgent(): Promise<FeedbackCoachingAgent> {
    const llm = await this.resolveLLM("FEEDBACK");
    return new FeedbackCoachingAgent(llm);
  }
}

export const globalAgentContainer = new AgentContainer();
