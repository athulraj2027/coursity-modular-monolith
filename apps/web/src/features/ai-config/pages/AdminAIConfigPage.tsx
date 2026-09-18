import React, { useState, useEffect } from "react";
import { aiConfigApi } from "../api/ai-config.api";
import type {
  AIProvider,
  AIModel,
  AICredential,
  AIConfigVersion,
  AIAuditLog,
  AIAgentType,
  AgentConfig,
  ProviderHealthTestResult,
} from "../types/ai-config.types";
import {
  Cpu,
  Key,
  History,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Plus,
  Play,
  RotateCcw,
  Sliders,
  Sparkles,
  Lock,
} from "lucide-react";

const AGENT_LIST: { type: AIAgentType; name: string; description: string; defaultTemp: number }[] = [
  { type: "SUPERVISOR", name: "Interview Supervisor Agent", description: "Controls interview flow and decides next action in real-time", defaultTemp: 0.1 },
  { type: "INTERVIEW_PLANNER", name: "Interview Planner Agent", description: "Creates and dynamically updates structured evaluation plan", defaultTemp: 0.2 },
  { type: "QUESTION_GENERATOR", name: "Question Generation Agent", description: "Synthesizes context-aware, topic-specific interview questions", defaultTemp: 0.3 },
  { type: "ANSWER_ANALYZER", name: "Answer Analysis Agent", description: "Evaluates correctness, relevance, completeness, and clarity", defaultTemp: 0.1 },
  { type: "EVIDENCE_EXTRACTOR", name: "Evidence Extraction Agent", description: "Extracts technical claims, concrete examples, and metrics", defaultTemp: 0.1 },
  { type: "FOLLOW_UP", name: "Follow-up Agent", description: "Generates targeted probing questions based on missing depth", defaultTemp: 0.2 },
  { type: "DIFFICULTY_ADAPTER", name: "Difficulty Adaptation Agent", description: "Adjusts question difficulty based on demonstrated ability", defaultTemp: 0.1 },
  { type: "CONVERSATION_QUALITY", name: "Conversation Quality Agent", description: "Detects rambling, brevity, off-topic, and sentiment signals", defaultTemp: 0.1 },
  { type: "EVALUATOR", name: "Interview Evaluation Agent", description: "Evaluates complete interview against rubric criteria", defaultTemp: 0.1 },
  { type: "REPORT_GENERATOR", name: "Report Generation Agent", description: "Produces structured candidate assessment dossier & report", defaultTemp: 0.2 },
  { type: "FEEDBACK", name: "Feedback/Coaching Agent", description: "Generates candidate-facing strengths & actionable growth steps", defaultTemp: 0.3 },
  { type: "INTEGRITY", name: "Integrity/Anomaly Agent", description: "Scans for prompt injection and interview anomalies", defaultTemp: 0.0 },
];

export const AdminAIConfigPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"credentials" | "models" | "agents" | "versions">("credentials");
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [models, setModels] = useState<AIModel[]>([]);
  const [credentials, setCredentials] = useState<AICredential[]>([]);
  const [publishedVersion, setPublishedVersion] = useState<AIConfigVersion | null>(null);
  const [draftVersion, setDraftVersion] = useState<AIConfigVersion | null>(null);
  const [versions, setVersions] = useState<AIConfigVersion[]>([]);
  const [auditLogs, setAuditLogs] = useState<AIAuditLog[]>([]);

  // Modals & form state
  const [showAddProviderModal, setShowAddProviderModal] = useState(false);
  const [showAddCredModal, setShowAddCredModal] = useState(false);
  const [showAddModelModal, setShowAddModelModal] = useState(false);
  const [newProviderForm, setNewProviderForm] = useState({ name: "", slug: "", type: "LLM" });
  const [newCredForm, setNewCredForm] = useState({ providerId: "", name: "", apiKey: "" });
  const [newModelForm, setNewModelForm] = useState({ providerId: "", name: "", modelId: "", type: "LLM" });
  const [testingCredId, setTestingCredId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; result: ProviderHealthTestResult } | null>(null);
  const [agentFormState, setAgentFormState] = useState<Record<string, AgentConfig>>({});
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [pRes, mRes, cRes, cfgRes, vRes, aRes] = await Promise.all([
        aiConfigApi.getProviders(),
        aiConfigApi.getModels(),
        aiConfigApi.getCredentials(),
        aiConfigApi.getConfig(),
        aiConfigApi.getVersions(),
        aiConfigApi.getAuditLogs(20),
      ]);

      setProviders(pRes.data || []);
      setModels(mRes.data || []);
      setCredentials(cRes.data || []);
      setPublishedVersion(cfgRes.data?.published || null);
      setDraftVersion(cfgRes.data?.draft || null);
      setVersions(vRes.data || []);
      setAuditLogs(aRes.data || []);

      // Initialize Agent Matrix form state
      const initialConfigs = cfgRes.data?.draft?.agentConfigs || cfgRes.data?.published?.agentConfigs || [];
      const stateMap: Record<string, AgentConfig> = {};

      for (const item of AGENT_LIST) {
        const found = initialConfigs.find((c: any) => c.agentType === item.type);
        stateMap[item.type] = found || {
          agentType: item.type,
          modelId: mRes.data?.[0]?.id || "",
          credentialId: cRes.data?.[0]?.id || "",
          enabled: true,
          temperature: item.defaultTemp,
          fallbackConfigs: [],
        };
      }
      setAgentFormState(stateMap);
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.message || "Failed to load AI configuration data." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleTestCredential = async (id: string) => {
    setTestingCredId(id);
    try {
      const res = await aiConfigApi.testCredential(id);
      setTestResult({ id, result: res.data });
      await loadAllData();
    } catch (err: any) {
      setTestResult({
        id,
        result: { valid: false, provider: "unknown", checkedAt: new Date().toISOString(), latencyMs: 0, error: err.message },
      });
    } finally {
      setTestingCredId(null);
    }
  };

  const handleCreateProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProviderForm.name || !newProviderForm.slug) return;
    try {
      await aiConfigApi.createProvider({
        name: newProviderForm.name,
        slug: newProviderForm.slug.toLowerCase().trim(),
        type: newProviderForm.type,
      });
      setShowAddProviderModal(false);
      setNewProviderForm({ name: "", slug: "", type: "LLM" });
      setActionMessage({ type: "success", text: "AI Provider registered successfully." });
      await loadAllData();
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.message });
    }
  };

  const handleCreateCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCredForm.providerId || !newCredForm.apiKey) return;
    try {
      await aiConfigApi.createCredential(newCredForm);
      setShowAddCredModal(false);
      setNewCredForm({ providerId: "", name: "", apiKey: "" });
      setActionMessage({ type: "success", text: "API Credential stored securely in encrypted vault." });
      await loadAllData();
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.message });
    }
  };

  const handleCreateModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModelForm.providerId || !newModelForm.modelId) return;
    try {
      await aiConfigApi.createModel(newModelForm);
      setShowAddModelModal(false);
      setNewModelForm({ providerId: "", name: "", modelId: "", type: "LLM" });
      setActionMessage({ type: "success", text: "AI Model registered successfully." });
      await loadAllData();
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.message });
    }
  };

  const handleSaveDraft = async () => {
    try {
      const configs = Object.values(agentFormState);
      await aiConfigApi.saveDraft({
        name: `Draft Update ${new Date().toLocaleDateString()}`,
        agentConfigs: configs,
      });
      setActionMessage({ type: "success", text: "Agent configuration saved as working draft." });
      await loadAllData();
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.message });
    }
  };

  const handlePublishDraft = async (versionId: string) => {
    try {
      await aiConfigApi.publishConfig(versionId);
      setActionMessage({ type: "success", text: "Configuration version published to production!" });
      await loadAllData();
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.message });
    }
  };

  const handleRollback = async (targetVersionId: string) => {
    if (!confirm("Are you sure you want to rollback to this version? A new published version will be created.")) return;
    try {
      await aiConfigApi.rollbackConfig(targetVersionId);
      setActionMessage({ type: "success", text: "Configuration rolled back successfully." });
      await loadAllData();
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.message });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 text-white p-6 rounded-2xl border border-neutral-800 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F42A18]/20 text-[#F42A18] border border-[#F42A18]/30">
              <Sparkles className="w-3 h-3" /> Production AI Engine
            </span>
            {publishedVersion ? (
              <span className="inline-flex items-center gap-1 text-xs font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3" /> v{publishedVersion.version} Live
              </span>
            ) : (
              <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">
                .env Fallback Mode
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight">AI Provider & Model Credentials</h1>
          <p className="text-sm text-neutral-400">
            Manage decoupled AI providers, encrypted API keys, 12-agent routing, and zero-downtime version publishing.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadAllData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg border border-neutral-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      {actionMessage && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center justify-between ${
            actionMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
              : "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800"
          }`}
        >
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="text-xs font-bold opacity-70 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* 2. Tab Navigation */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 space-x-2">
        <button
          onClick={() => setActiveTab("credentials")}
          className={`pb-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === "credentials"
              ? "border-[#F42A18] text-[#F42A18]"
              : "border-transparent text-neutral-500 hover:text-neutral-900 dark:text-neutral-400"
          }`}
        >
          <Key className="w-4 h-4" /> Providers & Credentials ({credentials.length})
        </button>
        <button
          onClick={() => setActiveTab("models")}
          className={`pb-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === "models"
              ? "border-[#F42A18] text-[#F42A18]"
              : "border-transparent text-neutral-500 hover:text-neutral-900 dark:text-neutral-400"
          }`}
        >
          <Cpu className="w-4 h-4" /> Models Registry ({models.length})
        </button>
        <button
          onClick={() => setActiveTab("agents")}
          className={`pb-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === "agents"
              ? "border-[#F42A18] text-[#F42A18]"
              : "border-transparent text-neutral-500 hover:text-neutral-900 dark:text-neutral-400"
          }`}
        >
          <Sliders className="w-4 h-4" /> 12-Agent Matrix
        </button>
        <button
          onClick={() => setActiveTab("versions")}
          className={`pb-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === "versions"
              ? "border-[#F42A18] text-[#F42A18]"
              : "border-transparent text-neutral-500 hover:text-neutral-900 dark:text-neutral-400"
          }`}
        >
          <History className="w-4 h-4" /> Versions & Deployments ({versions.length})
        </button>
      </div>

      {/* 3. Tab Contents */}

      {/* TAB 1: Providers & Credentials */}
      {activeTab === "credentials" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">AI Providers & API Credentials</h2>
              <p className="text-xs text-neutral-500">Configure provider endpoints and store encrypted API keys.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddProviderModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white text-xs font-semibold rounded-lg border border-neutral-300 dark:border-neutral-700 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Add Provider
              </button>
              <button
                onClick={() => setShowAddCredModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#F42A18] hover:bg-[#d82212] text-white text-xs font-semibold rounded-lg shadow transition"
              >
                <Plus className="w-3.5 h-3.5" /> Add Credential
              </button>
            </div>
          </div>

          {providers.length === 0 ? (
            <div className="p-6 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 text-center space-y-3">
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">No AI providers registered yet.</p>
              <button
                onClick={() => setShowAddProviderModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#F42A18] text-white text-xs font-semibold rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" /> Register First Provider
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {providers.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-sm text-neutral-900 dark:text-white">{p.name}</h3>
                      <span className="text-xs text-neutral-500 uppercase tracking-wider font-mono">{p.slug}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 font-bold uppercase rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                      {p.type}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-500 flex items-center gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                    <span>{(p as any)._count?.models || 0} Models</span>
                    <span>{(p as any)._count?.credentials || 0} Keys</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Test connection alert result if available */}
          {testResult && (
            <div
              className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
                testResult.result.valid
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300"
              }`}
            >
              <div>
                <p className="font-bold">
                  {testResult.result.valid ? "Connection Verified" : "Connection Failed"}: {testResult.result.provider}
                </p>
                <p>{testResult.result.message || testResult.result.error || `Latency: ${testResult.result.latencyMs}ms`}</p>
              </div>
              <button onClick={() => setTestResult(null)} className="font-bold opacity-70 hover:opacity-100">
                ✕
              </button>
            </div>
          )}

          {/* Credentials Table */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-300 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Provider</th>
                  <th className="p-3.5">Credential Name</th>
                  <th className="p-3.5">Masked Key</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Health Ping</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {credentials.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-neutral-400 text-sm">
                      No API credentials configured yet. Click "Add Credential" to register one.
                    </td>
                  </tr>
                ) : (
                  credentials.map((cred) => (
                    <tr key={cred.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                      <td className="p-3.5 font-medium text-neutral-900 dark:text-white">
                        {cred.provider?.name || "Provider"}
                      </td>
                      <td className="p-3.5 font-medium text-neutral-700 dark:text-neutral-300">{cred.name}</td>
                      <td className="p-3.5 font-mono text-xs text-neutral-500">••••••••{cred.lastFour}</td>
                      <td className="p-3.5">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                            cred.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                          }`}
                        >
                          {cred.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-xs">
                        {cred.lastTestStatus === "SUCCESS" ? (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> {cred.lastTestLatency}ms
                          </span>
                        ) : cred.lastTestStatus === "FAILED" ? (
                          <span className="text-red-500 flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Failed
                          </span>
                        ) : (
                          <span className="text-neutral-400">Untested</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleTestCredential(cred.id)}
                          disabled={testingCredId === cred.id || cred.status === "REVOKED"}
                          className="px-2.5 py-1 text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded transition"
                        >
                          {testingCredId === cred.id ? "Testing..." : "Test Connection"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Models Registry */}
      {activeTab === "models" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Registered AI Models</h2>
            <button
              onClick={() => setShowAddModelModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#F42A18] hover:bg-[#d82212] text-white text-xs font-semibold rounded-lg shadow transition"
            >
              <Plus className="w-4 h-4" /> Register Model
            </button>
          </div>

          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-300 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Provider</th>
                  <th className="p-3.5">Display Name</th>
                  <th className="p-3.5">Model ID</th>
                  <th className="p-3.5">Capability</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {models.map((m) => (
                  <tr key={m.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                    <td className="p-3.5 font-medium text-neutral-900 dark:text-white">
                      {m.provider?.name || "Provider"}
                    </td>
                    <td className="p-3.5 font-medium text-neutral-800 dark:text-neutral-200">{m.name}</td>
                    <td className="p-3.5 font-mono text-xs text-neutral-500">{m.modelId}</td>
                    <td className="p-3.5">
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                        {m.type}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: 12-Agent Matrix */}
      {activeTab === "agents" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">12-Agent Cognitive Routing Matrix</h2>
              <p className="text-xs text-neutral-500">
                Assign primary models, encrypted credentials, and automatic failover fallbacks per agent.
              </p>
            </div>
            <button
              onClick={handleSaveDraft}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#F42A18] hover:bg-[#d82212] text-white text-xs font-semibold rounded-lg shadow transition"
            >
              <SaveIcon className="w-4 h-4" /> Save as Working Draft
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AGENT_LIST.map((agent) => {
              const currentConfig = agentFormState[agent.type] || {
                agentType: agent.type,
                modelId: "",
                credentialId: "",
                enabled: true,
                temperature: agent.defaultTemp,
              };

              return (
                <div
                  key={agent.type}
                  className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-sm text-neutral-900 dark:text-white">{agent.name}</h3>
                      <p className="text-xs text-neutral-500">{agent.description}</p>
                    </div>
                    <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentConfig.enabled}
                        onChange={(e) =>
                          setAgentFormState({
                            ...agentFormState,
                            [agent.type]: { ...currentConfig, enabled: e.target.checked },
                          })
                        }
                        className="rounded text-[#F42A18] focus:ring-[#F42A18]"
                      />
                      <span>Active</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                    <div>
                      <label className="text-[11px] font-semibold text-neutral-500 block mb-1">Primary Model</label>
                      <select
                        value={currentConfig.modelId}
                        onChange={(e) =>
                          setAgentFormState({
                            ...agentFormState,
                            [agent.type]: { ...currentConfig, modelId: e.target.value },
                          })
                        }
                        className="w-full text-xs p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                      >
                        <option value="">Select Model</option>
                        {models.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.provider?.name}: {m.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-neutral-500 block mb-1">API Credential</label>
                      <select
                        value={currentConfig.credentialId}
                        onChange={(e) =>
                          setAgentFormState({
                            ...agentFormState,
                            [agent.type]: { ...currentConfig, credentialId: e.target.value },
                          })
                        }
                        className="w-full text-xs p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                      >
                        <option value="">Select Credential</option>
                        {credentials.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} (••••{c.lastFour})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-neutral-500 block mb-1">
                        Temperature: {currentConfig.temperature}
                      </label>
                      <input
                        type="range"
                        min="0.0"
                        max="1.0"
                        step="0.05"
                        value={currentConfig.temperature}
                        onChange={(e) =>
                          setAgentFormState({
                            ...agentFormState,
                            [agent.type]: { ...currentConfig, temperature: parseFloat(e.target.value) },
                          })
                        }
                        className="w-full accent-[#F42A18]"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: Versions & Deployments */}
      {activeTab === "versions" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Published Card */}
            <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500 text-white">
                    Live Production
                  </span>
                  <h3 className="font-bold text-lg text-neutral-900 dark:text-white mt-1">
                    v{publishedVersion?.version || 0}: {publishedVersion?.name || "Environment Default"}
                  </h3>
                </div>
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="text-xs text-neutral-500">
                Published: {publishedVersion?.publishedAt ? new Date(publishedVersion.publishedAt).toLocaleString() : "Active bootstrap"}
              </p>
            </div>

            {/* Draft Card */}
            <div className="p-5 rounded-xl border border-amber-500/30 bg-amber-50/20 dark:bg-amber-950/20 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500 text-white">
                    Working Draft
                  </span>
                  <h3 className="font-bold text-lg text-neutral-900 dark:text-white mt-1">
                    v{draftVersion?.version || (publishedVersion ? publishedVersion.version + 1 : 1)}:{" "}
                    {draftVersion?.name || "Pending Changes"}
                  </h3>
                </div>
                {draftVersion && (
                  <button
                    onClick={() => handlePublishDraft(draftVersion.id)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow transition"
                  >
                    <Play className="w-3.5 h-3.5" /> Publish to Live
                  </button>
                )}
              </div>
              <p className="text-xs text-neutral-500">
                {draftVersion?.agentConfigs?.length || 0} agent configurations ready to be promoted.
              </p>
            </div>
          </div>

          {/* Version History Table */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm space-y-2 p-4">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white">Historical Deployments & Rollbacks</h3>
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-300 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Version</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Created / Published</th>
                  <th className="p-3 text-right">Rollback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 text-xs">
                {versions.map((ver) => (
                  <tr key={ver.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                    <td className="p-3 font-bold">v{ver.version}</td>
                    <td className="p-3 font-medium text-neutral-700 dark:text-neutral-300">{ver.name}</td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          ver.status === "PUBLISHED"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : ver.status === "DRAFT"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                        }`}
                      >
                        {ver.status}
                      </span>
                    </td>
                    <td className="p-3 text-neutral-500">{new Date(ver.createdAt).toLocaleString()}</td>
                    <td className="p-3 text-right">
                      {ver.status === "ARCHIVED" && (
                        <button
                          onClick={() => handleRollback(ver.id)}
                          className="px-2.5 py-1 text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded transition flex items-center gap-1 ml-auto"
                        >
                          <RotateCcw className="w-3 h-3" /> Rollback
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Audit Logs */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm space-y-2 p-4">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white">Audit Log Trail</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
              {auditLogs.length === 0 ? (
                <p className="text-neutral-400 p-2">No audit logs recorded yet.</p>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="pt-2 flex justify-between items-center text-neutral-600 dark:text-neutral-300">
                    <div>
                      <span className="font-mono font-bold text-[#F42A18] mr-2">{log.action}</span>
                      <span className="text-neutral-400">({log.resourceType}: {log.resourceId})</span>
                    </div>
                    <span className="text-neutral-400 font-mono text-[11px]">{new Date(log.createdAt).toLocaleTimeString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Provider */}
      {showAddProviderModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#F42A18]" /> Register AI Provider
            </h3>
            <form onSubmit={handleCreateProvider} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Provider Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Google Gemini, Mistral AI, Cohere"
                  value={newProviderForm.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
                    setNewProviderForm({ ...newProviderForm, name, slug: newProviderForm.slug ? newProviderForm.slug : slug });
                  }}
                  className="w-full text-xs p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Provider Slug / Identifier
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. gemini, openai, anthropic, mistral"
                  value={newProviderForm.slug}
                  onChange={(e) => setNewProviderForm({ ...newProviderForm, slug: e.target.value.toLowerCase() })}
                  className="w-full text-xs p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Provider Type / Capability
                </label>
                <select
                  value={newProviderForm.type}
                  onChange={(e) => setNewProviderForm({ ...newProviderForm, type: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                >
                  <option value="LLM">LLM (Language Model)</option>
                  <option value="STT">STT (Speech to Text)</option>
                  <option value="TTS">TTS (Text to Speech)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddProviderModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 dark:text-neutral-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-[#F42A18] hover:bg-[#d82212] text-white rounded-lg transition"
                >
                  Save Provider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Credential */}
      {showAddCredModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#F42A18]" /> Register API Credential
            </h3>
            <form onSubmit={handleCreateCredential} className="space-y-3.5">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Provider
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddCredModal(false);
                      setShowAddProviderModal(true);
                    }}
                    className="text-[11px] text-[#F42A18] hover:underline"
                  >
                    + New Provider
                  </button>
                </div>
                <select
                  required
                  value={newCredForm.providerId}
                  onChange={(e) => setNewCredForm({ ...newCredForm, providerId: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                >
                  <option value="">Select AI Provider</option>
                  {providers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Credential Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Production Gemini API Key"
                  value={newCredForm.name}
                  onChange={(e) => setNewCredForm({ ...newCredForm, name: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Secret API Key
                </label>
                <input
                  type="password"
                  required
                  placeholder="Paste raw key (encrypted on save)"
                  value={newCredForm.apiKey}
                  onChange={(e) => setNewCredForm({ ...newCredForm, apiKey: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white font-mono"
                />
                <p className="text-[11px] text-neutral-500 mt-1">
                  Keys are encrypted with AES-256-GCM. Plaintext is never stored in DB or returned.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddCredModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 dark:text-neutral-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-[#F42A18] hover:bg-[#d82212] text-white rounded-lg transition"
                >
                  Save Credential
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Model */}
      {showAddModelModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#F42A18]" /> Register AI Model
            </h3>
            <form onSubmit={handleCreateModel} className="space-y-3.5">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Provider
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModelModal(false);
                      setShowAddProviderModal(true);
                    }}
                    className="text-[11px] text-[#F42A18] hover:underline"
                  >
                    + New Provider
                  </button>
                </div>
                <select
                  required
                  value={newModelForm.providerId}
                  onChange={(e) => setNewModelForm({ ...newModelForm, providerId: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                >
                  <option value="">Select AI Provider</option>
                  {providers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Model Display Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gemini 2.5 Flash"
                  value={newModelForm.name}
                  onChange={(e) => setNewModelForm({ ...newModelForm, name: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Provider Model ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. gemini-1.5-flash"
                  value={newModelForm.modelId}
                  onChange={(e) => setNewModelForm({ ...newModelForm, modelId: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModelModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 dark:text-neutral-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-[#F42A18] hover:bg-[#d82212] text-white rounded-lg transition"
                >
                  Register Model
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

function SaveIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
      />
    </svg>
  );
}

export default AdminAIConfigPage;
