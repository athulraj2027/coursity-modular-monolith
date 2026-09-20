import { apiClient } from "@/lib/api-client";
import type {
  Category,
  CategoryTreeNode,
  CategoryMetrics,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  CategoryQueryParams,
} from "../types/category.types";

export const categoryApi = {
  // Public
  getPublicCategories: async (tree = false): Promise<Category[] | CategoryTreeNode[]> => {
    const res = await apiClient<{ success: boolean; data: any }>(
      `/categories${tree ? "?format=tree" : ""}`,
      { method: "GET" }
    );
    return res.data;
  },

  getCategoryBySlug: async (slug: string): Promise<Category> => {
    const res = await apiClient<{ success: boolean; data: Category }>(
      `/categories/slug/${slug}`,
      { method: "GET" }
    );
    return res.data;
  },

  // Admin
  adminGetAll: async (params?: CategoryQueryParams): Promise<{ items: Category[]; total: number }> => {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.parentId !== undefined) {
      if (params.parentId === null) query.append("onlyParents", "true");
      else query.append("parentId", params.parentId);
    }
    if (params?.onlyParents) query.append("onlyParents", "true");
    if (params?.isActive !== undefined) query.append("isActive", String(params.isActive));
    if (params?.isFeatured !== undefined) query.append("isFeatured", String(params.isFeatured));
    if (params?.isDeleted !== undefined) query.append("isDeleted", String(params.isDeleted));
    if (params?.includeDeleted) query.append("includeDeleted", "true");
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.sortBy) query.append("sortBy", params.sortBy);
    if (params?.sortOrder) query.append("sortOrder", params.sortOrder);

    const queryString = query.toString();
    const url = `/categories/admin/all${queryString ? `?${queryString}` : ""}`;

    const res = await apiClient<{ success: boolean; data: Category[]; meta?: { total: number } }>(url, {
      method: "GET",
    });

    return {
      items: res.data,
      total: res.meta?.total ?? res.data.length,
    };
  },

  adminGetTree: async (includeInactive = true, includeDeleted = false): Promise<CategoryTreeNode[]> => {
    const res = await apiClient<{ success: boolean; data: CategoryTreeNode[] }>(
      `/categories/admin/tree?includeInactive=${includeInactive}&includeDeleted=${includeDeleted}`,
      { method: "GET" }
    );
    return res.data;
  },

  adminGetMetrics: async (): Promise<CategoryMetrics> => {
    const res = await apiClient<{ success: boolean; data: CategoryMetrics }>(
      "/categories/admin/metrics",
      { method: "GET" }
    );
    return res.data;
  },

  adminGetById: async (id: string): Promise<Category> => {
    const res = await apiClient<{ success: boolean; data: Category }>(
      `/categories/admin/${id}`,
      { method: "GET" }
    );
    return res.data;
  },

  adminCreate: async (payload: CreateCategoryPayload): Promise<Category> => {
    const res = await apiClient<{ success: boolean; message: string; data: Category }>(
      "/categories/admin",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
    return res.data;
  },

  adminUpdate: async (id: string, payload: UpdateCategoryPayload): Promise<Category> => {
    const res = await apiClient<{ success: boolean; message: string; data: Category }>(
      `/categories/admin/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    );
    return res.data;
  },

  adminToggleStatus: async (id: string, isActive: boolean): Promise<Category> => {
    const res = await apiClient<{ success: boolean; message: string; data: Category }>(
      `/categories/admin/${id}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ isActive }),
      }
    );
    return res.data;
  },

  adminSoftDelete: async (id: string): Promise<Category> => {
    const res = await apiClient<{ success: boolean; message: string; data: Category }>(
      `/categories/admin/${id}`,
      { method: "DELETE" }
    );
    return res.data;
  },

  adminRestore: async (id: string): Promise<Category> => {
    const res = await apiClient<{ success: boolean; message: string; data: Category }>(
      `/categories/admin/${id}/restore`,
      { method: "POST" }
    );
    return res.data;
  },

  adminHardDelete: async (id: string): Promise<boolean> => {
    const res = await apiClient<{ success: boolean; message: string }>(
      `/categories/admin/${id}/permanent`,
      { method: "DELETE" }
    );
    return res.success;
  },
};

export default categoryApi;
