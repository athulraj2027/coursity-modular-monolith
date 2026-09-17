import { StateGraph, START, END } from "@langchain/langgraph";
import {
  InterviewStateAnnotation,
  InterviewGraphStateType,
} from "./state-annotations";
import { plannerNode } from "./nodes/planner.node";
import { turnAnalysisNode } from "./nodes/turn-analysis.node";
import { supervisorNode } from "./nodes/supervisor.node";
import { questionNode } from "./nodes/question.node";
import { followUpNode } from "./nodes/follow-up.node";
import { evaluateNode } from "./nodes/evaluate.node";
import { routeFromSupervisor } from "./routing/interview-router";

export class InterviewLangGraph {
  private app: any;

  constructor() {
    const workflow = new StateGraph(InterviewStateAnnotation)
      .addNode("planner", plannerNode)
      .addNode("turn_analysis", turnAnalysisNode)
      .addNode("supervisor", supervisorNode)
      .addNode("question", questionNode)
      .addNode("follow_up", followUpNode)
      .addNode("evaluate", evaluateNode)

      // Start Router
      .addConditionalEdges(START, (state: InterviewGraphStateType) => {
        if (!state.plan && (state.phase === "INITIALIZING" || state.phase === "PLANNING")) {
          return "planner";
        }
        if (state.candidateAnswer && state.phase !== "INITIALIZING") {
          return "turn_analysis";
        }
        return "supervisor";
      })

      .addEdge("planner", "supervisor")
      .addEdge("turn_analysis", "supervisor")

      .addConditionalEdges("supervisor", routeFromSupervisor, {
        question: "question",
        follow_up: "follow_up",
        evaluate: "evaluate",
      })

      .addEdge("question", END)
      .addEdge("follow_up", END)
      .addEdge("evaluate", END);

    this.app = workflow.compile();
  }

  async invoke(
    initialState: Partial<InterviewGraphStateType>
  ): Promise<InterviewGraphStateType> {
    return this.app.invoke(initialState);
  }
}
