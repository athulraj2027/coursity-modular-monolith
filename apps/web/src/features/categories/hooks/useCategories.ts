import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import { categoryApi } from "../api/category.api";
import type {
  CreateCategoryPayload,
  UpdateCategoryPayload,
  CategoryQueryParams,
} from "../types/category.types";

export const CATEGORY_QUERY_KEYS = {
  all: ["categories"] as const,
  lists: () => [...CATEGORY_QUERY_KEYS.all, "list"] as const,
  list: (params?: CategoryQueryParams) => [...CATEGORY_QUERY_KEYS.lists(), params] as const,
  tree: (includeInactive?: boolean, includeDeleted?: boolean) =>
    [...CATEGORY_QUERY_KEYS.all, "tree", { includeInactive, includeDeleted }] as const,
  metrics: () => [...CATEGORY_QUERY_KEYS.all, "metrics"] as const,
  detail: (id: string) => [...CATEGORY_QUERY_KEYS.all, "detail", id] as const,
  publicTree: () => [...CATEGORY_QUERY_KEYS.all, "public-tree"] as const,
};

// 1. Hook for public category tree
export const usePublicCategoryTree = () => {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.publicTree(),
    queryFn: () => categoryApi.getPublicCategories(true),
    staleTime: 5 * 60 * 1000,
  });
};

// 2. Hook for admin category list
export const useAdminCategories = (params?: CategoryQueryParams) => {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.list(params),
    queryFn: () => categoryApi.adminGetAll(params),
  });
};

// 3. Hook for admin category tree
export const useAdminCategoryTree = (includeInactive = true, includeDeleted = false) => {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.tree(includeInactive, includeDeleted),
    queryFn: () => categoryApi.adminGetTree(includeInactive, includeDeleted),
  });
};

// 4. Hook for admin category metrics
export const useAdminCategoryMetrics = () => {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.metrics(),
    queryFn: () => categoryApi.adminGetMetrics(),
  });
};

// 5. Hook for single category
export const useAdminCategory = (id: string) => {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.detail(id),
    queryFn: () => categoryApi.adminGetById(id),
    enabled: !!id,
  });
};

// 6. Mutation: Create category
export const useAdminCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) => categoryApi.adminCreate(payload),
    onSuccess: (data) => {
      toast.success(`Category "${data.name}" created successfully`);
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.all });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to create category");
    },
  });
};

// 7. Mutation: Update category
export const useAdminUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCategoryPayload }) =>
      categoryApi.adminUpdate(id, payload),
    onSuccess: (data) => {
      toast.success(`Category "${data.name}" updated successfully`);
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.all });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to update category");
    },
  });
};

// 8. Mutation: Toggle category active status
export const useAdminToggleCategoryStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      categoryApi.adminToggleStatus(id, isActive),
    onSuccess: (data) => {
      toast.success(`Category "${data.name}" ${data.isActive ? "activated" : "deactivated"}`);
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.all });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to change category status");
    },
  });
};

// 9. Mutation: Soft-delete category
export const useAdminSoftDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoryApi.adminSoftDelete(id),
    onSuccess: (data) => {
      toast.success(`Category "${data.name}" moved to Trash`);
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.all });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to delete category");
    },
  });
};

// 10. Mutation: Restore category
export const useAdminRestoreCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoryApi.adminRestore(id),
    onSuccess: (data) => {
      toast.success(`Category "${data.name}" restored successfully`);
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.all });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to restore category");
    },
  });
};

// 11. Mutation: Permanent delete category
export const useAdminHardDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoryApi.adminHardDelete(id),
    onSuccess: () => {
      toast.success("Category permanently deleted");
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.all });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to permanently delete category");
    },
  });
};
