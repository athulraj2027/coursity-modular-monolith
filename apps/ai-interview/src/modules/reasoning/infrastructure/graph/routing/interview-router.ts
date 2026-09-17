import { InterviewGraphStateType } from "../state-annotations";

export type RoutingTarget = "question" | "follow_up" | "evaluate";

export function routeFromSupervisor(state: InterviewGraphStateType): RoutingTarget {
  switch (state.nextAction) {
    case "GREETING":
    case "ASK_QUESTION":
    case "CLARIFY":
      return "question";
    case "FOLLOW_UP":
      return "follow_up";
    case "END_INTERVIEW":
      return "evaluate";
    default:
      return "question";
  }
}
