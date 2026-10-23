import { InterviewGraphStateType } from "../../infrastructure/graph/state-annotations";

export interface IInterviewGraph {
  invoke(initialState: Partial<InterviewGraphStateType>): Promise<InterviewGraphStateType>;
}
