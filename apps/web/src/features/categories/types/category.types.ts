export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  image: string | null;
  parentId: string | null;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  parent?: Category | null;
  children?: Category[];
  _count?: {
    children: number;
  };
}

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
  subcategoryCount: number;
}

export interface CategoryMetrics {
  total: number;
  parentCategories: number;
  subcategories: number;
  active: number;
  inactive: number;
  deleted: number;
}

export interface CreateCategoryPayload {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  image?: string;
  parentId?: string | null;
  isActive?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
}

export interface UpdateCategoryPayload {
  name?: string;
  slug?: string;
  description?: string | null;
  icon?: string | null;
  image?: string | null;
  parentId?: string | null;
  isActive?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
}

export interface CategoryQueryParams {
  search?: string;
  parentId?: string | null;
  onlyParents?: boolean;
  isActive?: boolean;
  isFeatured?: boolean;
  isDeleted?: boolean;
  includeDeleted?: boolean;
  page?: number;
  limit?: number;
  sortBy?: "sortOrder" | "name" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}
