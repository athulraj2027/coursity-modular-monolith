import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { AIConfigClient } from "../src/shared/config/ai-config.client";
import { FallbackModelRouter } from "../src/modules/session/infrastructure/routing/fallback-model.router";
import { ProviderRegistry } from "../src/modules/session/infrastructure/registry/provider.registry";
import { ILLMService } from "../src/modules/reasoning/domain/ports/llm.port";

class MockFailingLLM implements ILLMService {
  constructor(private shouldFail: boolean, private errorMessage: string, private resultText: string) {}

  async generateText(): Promise<string> {
    if (this.shouldFail) {
      throw new Error(this.errorMessage);
    }
    return this.resultText;
  }

  async generateStructured<T>(): Promise<T> {
    if (this.shouldFail) {
      throw new Error(this.errorMessage);
    }
    return { data: this.resultText } as unknown as T;
  }
}

describe("🛡️ AI Interview Dynamic Provider & Configuration Suite", () => {
  describe("1. AIConfigClient Fallback & Caching", () => {
    it("should build valid environment fallback config when backend is unavailable", async () => {
      const client = new AIConfigClient("http://127.0.0.1:9999", "dummy_secret");
      const config = await client.getActiveConfig();

      assert.strictEqual(config.version, 0);
      assert.strictEqual(config.name, "Environment Bootstrap Configuration");
      assert.ok(config.agents["SUPERVISOR"]);
      assert.strictEqual(config.agents["SUPERVISOR"].primary.providerType, "LLM");
    });

    it("should store and retrieve testing configuration", async () => {
      const client = new AIConfigClient();
      client.setActiveConfigForTesting({
        versionId: "v1_test",
        version: 1,
        name: "Test Config v1",
        publishedAt: new Date().toISOString(),
        agents: {
          QUESTION_GENERATOR: {
            agentType: "QUESTION_GENERATOR",
            enabled: true,
            temperature: 0.7,
            primary: { provider: "gemini", providerType: "LLM", modelId: "gemini-1.5-pro", apiKey: "test_key" },
            fallbacks: [],
          },
        },
      });

      const active = await client.getActiveConfig();
      assert.strictEqual(active.version, 1);
      assert.strictEqual(active.agents["QUESTION_GENERATOR"].primary.modelId, "gemini-1.5-pro");
    });
  });

  describe("2. FallbackModelRouter Multi-Provider Failover", () => {
    it("should return primary response when primary succeeds", async () => {
      const primary = {
        providerName: "gemini",
        modelId: "gemini-1.5-flash",
        service: new MockFailingLLM(false, "", "Primary LLM Success"),
      };
      const fallback = {
        providerName: "openai",
        modelId: "gpt-4o-mini",
        service: new MockFailingLLM(false, "", "Fallback Success"),
      };

      const router = new FallbackModelRouter(primary, [fallback]);
      const res = await router.generateText("Hello");
      assert.strictEqual(res, "Primary LLM Success");
    });

    it("should automatically failover to fallback model when primary encounters rate limit (429)", async () => {
      const primary = {
        providerName: "gemini",
        modelId: "gemini-1.5-flash",
        service: new MockFailingLLM(true, "Rate limit exceeded (429 Too Many Requests)", ""),
      };
      const fallback = {
        providerName: "openai",
        modelId: "gpt-4o-mini",
        service: new MockFailingLLM(false, "", "Fallback Model Responded Cleanly"),
      };

      const router = new FallbackModelRouter(primary, [fallback]);
      const res = await router.generateText("Test Prompt");
      assert.strictEqual(res, "Fallback Model Responded Cleanly");
    });

    it("should automatically failover on provider timeout (503 / timeout)", async () => {
      const primary = {
        providerName: "gemini",
        modelId: "gemini-1.5-flash",
        service: new MockFailingLLM(true, "Provider timeout error 503", ""),
      };
      const fallback = {
        providerName: "anthropic",
        modelId: "claude-3-haiku",
        service: new MockFailingLLM(false, "", "Anthropic Fallback Succeeded"),
      };

      const router = new FallbackModelRouter(primary, [fallback]);
      const res = await router.generateStructured<{ data: string }>("Test Prompt");
      assert.strictEqual(res.data, "Anthropic Fallback Succeeded");
    });
  });

  describe("3. ProviderRegistry Dynamic Resolution", () => {
    it("should resolve agent-configured LLM router", async () => {
      const configClient = new AIConfigClient();
      configClient.setActiveConfigForTesting({
        versionId: "v2_test",
        version: 2,
        name: "Production v2",
        publishedAt: new Date().toISOString(),
        agents: {
          EVALUATOR: {
            agentType: "EVALUATOR",
            enabled: true,
            temperature: 0.1,
            primary: { provider: "gemini", providerType: "LLM", modelId: "gemini-1.5-flash", apiKey: "mock_eval_key" },
            fallbacks: [
              { priority: 1, provider: "openai", providerType: "LLM", modelId: "gpt-4o", apiKey: "mock_backup_key" },
            ],
          },
        },
      });

      const registry = new ProviderRegistry(configClient);
      const llm = await registry.getLLM("EVALUATOR");
      assert.ok(llm);
      assert.ok(llm instanceof FallbackModelRouter);
    });
  });
});
