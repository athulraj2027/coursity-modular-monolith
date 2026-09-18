import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { InterviewLangGraph } from "../src/modules/reasoning/infrastructure/graph/interview-langgraph";

describe("InterviewLangGraph Multi-Agent Workflow", () => {
  const graph = new InterviewLangGraph();

  it("should initialize, run Planner and Supervisor, and output Greeting + Question 1", async () => {
    const result = await graph.invoke({
      interviewId: "sess_graph_test_1",
      candidate: {
        userId: "usr_alice",
        name: "Alice",
        bio: "Backend engineer",
      },
      domain: "Node.js & Backend",
      difficulty: "INTERMEDIATE",
      totalQuestions: 2,
    });

    assert.ok(result.plan !== undefined);
    assert.ok(result.responseText?.includes("Hello Alice"));
    assert.equal(result.phase, "QUESTION_ACTIVE");
    assert.equal(result.questionIndex, 1);
  });

  it("should execute candidate turn analysis (Agents 4,5,8,12,7) and finish evaluation", async () => {
    // 1. Initial State
    const startResult = await graph.invoke({
      interviewId: "sess_graph_test_2",
      candidate: {
        userId: "usr_emma",
        name: "Emma",
        experienceYears: 5,
      },
      domain: "Database Systems",
      difficulty: "ADVANCED",
      totalQuestions: 2,
      topics: ["ACID Properties", "Indexing"],
    });

    assert.equal(startResult.questionIndex, 1);

    // 2. Process candidate turns dynamically until session reaches completion
    let currentResult = startResult;
    const answers = [
      "Atomicity ensures all-or-nothing transactions using write-ahead logging.",
      "B-Tree indexes provide logarithmic search, insertion, and range scans.",
      "Isolation levels like Snapshot Isolation prevent dirty reads and phantom reads.",
    ];

    for (let i = 0; i < answers.length && currentResult.phase !== "COMPLETED"; i++) {
      currentResult = await graph.invoke({
        ...currentResult,
        candidateAnswer: answers[i],
      });
      assert.ok(currentResult.responseText !== undefined);
    }

    assert.ok(currentResult.phase === "COMPLETED" || currentResult.evaluation !== undefined);
    if (currentResult.evaluation) {
      assert.ok(currentResult.evaluation.overallScore >= 0);
    }
  });
});
