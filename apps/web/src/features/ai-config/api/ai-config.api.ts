import { apiClient } from "@/lib/api-client";
import type {
  AIProvider,
  AIModel,
  AICredential,
  AIConfigVersion,
  AIAuditLog,
  ProviderHealthTestResult,
  AgentConfig,
} from "../types/ai-config.types";

export const aiConfigApi = {
  // 1. Providers
  getProviders: async () => {
    return await apiClient<{ success: boolean; data: AIProvider[] }>("/admin/ai/providers", {
      method: "GET",
    });
  },

  createProvider: async (data: { slug: string; name: string; type: string; metadata?: Record<string, any> }) => {
    return await apiClient<{ success: boolean; data: AIProvider }>("/admin/ai/providers", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateProvider: async (id: string, data: { name?: string; status?: string }) => {
    return await apiClient<{ success: boolean; data: AIProvider }>(`/admin/ai/providers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  // 2. Models
  getModels: async (filters?: { providerId?: string; type?: string }) => {
    const params = new URLSearchParams();
    if (filters?.providerId) params.set("providerId", filters.providerId);
    if (filters?.type) params.set("type", filters.type);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return await apiClient<{ success: boolean; data: AIModel[] }>(`/admin/ai/models${qs}`, {
      method: "GET",
    });
  },

  createModel: async (data: { providerId: string; name: string; modelId: string; type: string }) => {
    return await apiClient<{ success: boolean; data: AIModel }>("/admin/ai/models", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // 3. Credentials
  getCredentials: async (providerId?: string) => {
    const qs = providerId ? `?providerId=${providerId}` : "";
    return await apiClient<{ success: boolean; data: AICredential[] }>(`/admin/ai/credentials${qs}`, {
      method: "GET",
    });
  },

  createCredential: async (data: { providerId: string; name: string; apiKey: string }) => {
    return await apiClient<{ success: boolean; data: AICredential }>("/admin/ai/credentials", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  rotateCredential: async (id: string, data: { apiKey: string; name?: string }) => {
    return await apiClient<{ success: boolean; data: AICredential }>(`/admin/ai/credentials/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  revokeCredential: async (id: string) => {
    return await apiClient<{ success: boolean; data: { success: boolean; message: string } }>(
      `/admin/ai/credentials/${id}`,
      {
        method: "DELETE",
      }
    );
  },

  testCredential: async (id: string) => {
    return await apiClient<{ success: boolean; data: ProviderHealthTestResult }>(
      `/admin/ai/credentials/${id}/test`,
      {
        method: "POST",
      }
    );
  },

  // 4. Configuration Versions & Agent Matrix
  getConfig: async () => {
    return await apiClient<{
      success: boolean;
      data: { published: AIConfigVersion | null; draft: AIConfigVersion | null };
    }>("/admin/ai/config", {
      method: "GET",
    });
  },

  saveDraft: async (data: { name?: string; description?: string; agentConfigs: AgentConfig[] }) => {
    return await apiClient<{ success: boolean; data: AIConfigVersion }>("/admin/ai/config/draft", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  publishConfig: async (versionId: string) => {
    return await apiClient<{ success: boolean; data: AIConfigVersion }>("/admin/ai/config/publish", {
      method: "POST",
      body: JSON.stringify({ versionId }),
    });
  },

  rollbackConfig: async (targetVersionId: string) => {
    return await apiClient<{ success: boolean; data: AIConfigVersion }>("/admin/ai/config/rollback", {
      method: "POST",
      body: JSON.stringify({ targetVersionId }),
    });
  },

  getVersions: async () => {
    return await apiClient<{ success: boolean; data: AIConfigVersion[] }>("/admin/ai/config/versions", {
      method: "GET",
    });
  },

  getAuditLogs: async (limit: number = 50) => {
    return await apiClient<{ success: boolean; data: AIAuditLog[] }>(`/admin/ai/audit?limit=${limit}`, {
      method: "GET",
    });
  },
};
